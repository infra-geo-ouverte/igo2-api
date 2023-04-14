import * as Boom from '@hapi/boom';

import { ObjectUtils } from '@igo2/base-api';

import { IUserIgo } from './userIgo.interface';
import { UserIgo } from './userIgo.model';

export class UserIgoService {
  public async create (userIgo: IUserIgo): Promise<UserIgo> {
    return await UserIgo.create(userIgo);
  }

  public async update (
    userId: string,
    userIgo: IUserIgo
  ): Promise<{ userId: string }> {
    return await UserIgo
      .update(userIgo, {
        where: {
          userId
        }
      })
      .then((count: [number]) => {
        if (!count[0]) {
          throw Boom.notFound();
        }
        return { userId };
      });
  }

  public async delete (userId: string): Promise<void> {
    return await UserIgo
      .destroy({
        where: {
          userId
        }
      })
      .then((count: number) => {
        if (!count) {
          throw Boom.notFound();
        }
      });
  }

  public async get (userId: string): Promise<UserIgo> {
    return await UserIgo
      .findOne({
        where: {
          userId
        }
      })
      .then((userIgo: UserIgo) => {
        if (!userIgo) {
          throw Boom.notFound();
        }
        return ObjectUtils.removeNull(userIgo.get());
      });
  }
}
