import { Utils, Op } from 'sequelize';

import { ObjectUtils } from '@igo2/base-api';
import { User } from './user.model';
import { UserIgoService } from '../userIgo/userIgo.service';

export class UserApi {
  static async getProfils (userId: string): Promise<string[]> {
    if (!userId) {
      return [];
    }
    const userIgoService = new UserIgoService();
    const a = await userIgoService.get(userId);
    return a.profils ? a.profils : [];
  }

  static async getUser (username: string): Promise<User> {
    return await User
      .findOne({
        where: {
          sourceId: username
        }
      })
      .then((user: User) => {
        return user;
      });
  }

  static async getAllUsers (limit: number = 10, filter?: string): Promise<User[]> {
    const opts: any = filter
      ? {
          where: {
            [Op.or]: [
              {
                sourceId: {
                  [Op.iLike]: `%${filter}%`
                }
              },
              new Utils.Where(new Utils.Fn('concat', [new Utils.Col('firstName'), ' ', new Utils.Col('lastName')]), {
                [Op.iLike]: `%${filter}%`
              })
            ]
          }
        }
      : {};

    opts.limit = limit;

    return await User.findAll(opts).then((users: User[]) => {
      return users.map(u => ObjectUtils.removeNull(u.get()));
    });
  }
}
