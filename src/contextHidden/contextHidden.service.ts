import * as Boom from '@hapi/boom';

import { ObjectUtils } from '@igo2/base-api';

import { ContextHidden } from './index';

export class ContextHiddenService {
  public async hide (user: string, contextId: string): Promise<ContextHidden> {
    return await ContextHidden.create({
      user,
      contextId
    }).catch((error) => {
      if (error?.data?.name === 'SequelizeUniqueConstraintError') {
        const message = 'Context already hidden.';
        throw Boom.conflict(message);
      }
      if (Boom.isBoom(error)) {
        throw error;
      }
      throw Boom.badImplementation(error);
    });
  }

  public async show (user: string, contextId: string): Promise<void> {
    return await ContextHidden.destroy({
      where: {
        user,
        contextId
      }
    }).then((count: number) => {
      if (!count) {
        throw Boom.notFound();
      }
    });
  }

  public async get (user: string): Promise<ContextHidden[]> {
    return await ContextHidden.findAll({
      where: {
        user
      }
    }).then((contextsHidden: ContextHidden[]) => {
      const plainContextHidden = contextsHidden.map((contextHidden) => {
        return ObjectUtils.removeNull(contextHidden.get());
      });
      return plainContextHidden;
    });
  }

  public async getById (user: string, contextId: string): Promise<ContextHidden> {
    return await ContextHidden.findOne({
      where: {
        user,
        contextId
      }
    }).then((contextHidden: ContextHidden) => {
      if (!contextHidden) {
        throw Boom.notFound();
      }
      return ObjectUtils.removeNull(contextHidden.get());
    });
  }
}
