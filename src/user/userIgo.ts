import * as Boom from 'boom';

import { IDatabase, database } from '../database';
import { ObjectUtils } from '../utils';

import { IUserIgo, UserIgoInstance } from './userIgo.model';

export class UserIgo {
  private database: IDatabase = database;

  constructor() {}

  public async create(userIgo: IUserIgo): Promise<UserIgoInstance> {
    return await this.database.userIgo.create(userIgo);
  }

  public async update(
    userId: string,
    userIgo: IUserIgo
  ): Promise<{ userId: string }> {
    return await this.database.userIgo
      .update(userIgo, {
        where: {
          userId: userId
        }
      })
      .then((count: [number, UserIgoInstance[]]) => {
        if (!count[0]) {
          throw Boom.notFound();
        }
        return { userId: userId };
      });
  }

  public async delete(userId: string): Promise<void> {
    return await this.database.userIgo
      .destroy({
        where: {
          userId: userId
        }
      })
      .then((count: number) => {
        if (!count) {
          throw Boom.notFound();
        }
        return;
      });
  }

  public async get(userId: string): Promise<UserIgoInstance> {
    return await this.database.userIgo
      .findOne({
        where: {
          userId: userId
        }
      })
      .then((userIgo: UserIgoInstance) => {
        if (!userIgo) {
          throw Boom.notFound();
        }
        return ObjectUtils.removeNull(userIgo.get());
      });
  }
}
