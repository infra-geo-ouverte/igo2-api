import * as Boom from 'boom';

import { IDatabase, database } from '../database';
import { ObjectUtils } from '../utils';

import { ContextHiddenInstance } from './index';

export class ContextHidden {
  private database: IDatabase = database;

  public async hide(user: string, contextId: string): Promise<ContextHiddenInstance> {
    return await this.database.contextHidden
      .create({
        user,
        contextId
      })
      .catch(error => {
        if (error.name === 'SequelizeUniqueConstraintError') {
          const message = 'Context already hidden.';
          throw Boom.conflict(message);
        } else {
          throw Boom.badImplementation(error);
        }
      });
  }

  public async show(user: string, contextId: string): Promise<void> {
    return await this.database.contextHidden
      .destroy({
        where: {
          user,
          contextId
        }
      })
      .then((count: number) => {
        if (!count) {
          throw Boom.notFound();
        }
        return;
      });
  }

  public async get(user: string): Promise<ContextHiddenInstance[]> {
    return await this.database.contextHidden
      .findAll({
        where: {
          user
        }
      })
      .then((contextsHidden: ContextHiddenInstance[]) => {
        const plainContextHidden = contextsHidden.map(contextHidden => {
          return ObjectUtils.removeNull(contextHidden.get());
        });
        return plainContextHidden;
      });
  }

  public async getById(user: string, contextId: string): Promise<ContextHiddenInstance> {
    return await this.database.contextHidden
      .findOne({
        where: {
          user,
          contextId
        }
      })
      .then((contextHidden: ContextHiddenInstance) => {
        return ObjectUtils.removeNull(contextHidden.get());
      });
  }
}
