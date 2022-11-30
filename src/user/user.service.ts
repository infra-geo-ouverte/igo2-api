import * as Boom from '@hapi/boom';

import { ObjectUtils } from '@igo2/base-api';

import { IUser } from './user.interface';
import { User } from './user.model';

export class UserService {
  public async create (user: IUser): Promise<User> {
    return await User
      .create(user)
      .then((userCreated: User) => {
        return ObjectUtils.removeNull(userCreated.get());
      });
  }

  public async update (
    id: string,
    user: IUser
  ): Promise<{ id: string }> {
    return await User
      .update(user, {
        where: {
          id: id
        }
      })
      .then((count: [number]) => {
        if (!count[0]) {
          throw Boom.notFound();
        }
        return { id };
      });
  }

  public async delete (id: string): Promise<void> {
    return await User
      .destroy({
        where: {
          id
        }
      })
      .then((count: number) => {
        if (!count) {
          throw Boom.notFound();
        }
      });
  }

  public async get (id: string): Promise<User> {
    return await User
      .findOne({
        where: {
          id
        }
      })
      .then((user: User) => {
        if (!user) {
          throw Boom.notFound();
        }
        return ObjectUtils.removeNull(user.get());
      });
  }

  public async getUserBySource (
    sourceId: string,
    sources: string | string[]
  ): Promise<User> {
    if (sources === 'facebook' || sources === 'google') {
      sources = ['facebook', 'google'];
    } else if (sources === 'ldap' || sources === 'microsoft' || sources === 'microsoftb2c') {
      sources = ['ldap', 'microsoft', 'microsoftb2c'];
    }
    return await User
      .findOne({
        where: {
          sourceId: sourceId,
          source: sources
        }
      })
      .then((user: User) => {
        if (!user) {
          throw Boom.notFound();
        }
        return ObjectUtils.removeNull(user.get());
      });
  }
}
