import * as Boom from 'boom';

import { IDatabase, database } from '../database';
import { ObjectUtils } from '../utils';
import { UserApi } from '../user';
import { ContextInstance, Scope } from '../context';

import {
  IContextPermission,
  ContextPermissionInstance,
  TypePermission
} from './index';

export class ContextPermission {
  private database: IDatabase = database;

  constructor() {}

  public async create(
    contextPermission: IContextPermission
  ): Promise<ContextPermissionInstance[]> {
    const bulkData: IContextPermission[] = [];

    const profils = contextPermission.profil.split(/[,;]/);
    for (let p of profils) {
      p = p.trim();
      if (p) {
        bulkData.push({
          profil: p,
          typePermission: contextPermission.typePermission,
          contextId: contextPermission.contextId
        });
      }
    }

    return await this.database.contextPermission
      .bulkCreate(bulkData, {
        individualHooks: true
      })
      .catch(error => {
        const uniqueFields = ['contextId', 'profil'];
        if (
          error.name === 'SequelizeUniqueConstraintError' &&
          Object.keys(error.fields).toString() === uniqueFields.toString()
        ) {
          const message = 'The pair contextId and profil must be unique.';
          throw Boom.conflict(message);
        } else {
          throw Boom.badImplementation(error);
        }
      });
  }

  public async update(
    id: string,
    contextPermission: IContextPermission
  ): Promise<{ id: string }> {
    return await this.database.contextPermission
      .update(contextPermission, {
        where: {
          id: id
        }
      })
      .then((count: [number, ContextPermissionInstance[]]) => {
        if (!count[0]) {
          throw Boom.notFound();
        }
        return { id: id };
      })
      .catch(error => {
        if (Boom.isBoom(error)) {
          throw error;
        }
        const uniqueFields = ['contextId', 'profil'];
        if (
          error.name === 'SequelizeUniqueConstraintError' &&
          Object.keys(error.fields).toString() === uniqueFields.toString()
        ) {
          const message = 'The pair contextId and profil must be unique.';
          throw Boom.conflict(message);
        }
        throw Boom.badImplementation(error);
      });
  }

  public async delete(id: string): Promise<void> {
    return await this.database.contextPermission
      .destroy({
        where: {
          id: id
        }
      })
      .then((count: number) => {
        if (!count) {
          throw Boom.notFound();
        }
        return;
      });
  }

  public async getByContextId(contextId): Promise<ContextPermissionInstance[]> {
    return await this.database.contextPermission
      .findAll({
        where: {
          contextId: contextId
        }
      })
      .then((contextPermissions: ContextPermissionInstance[]) => {
        const plainContextPermissions = contextPermissions.map(
          contextPermission => {
            return ObjectUtils.removeNull(contextPermission.get());
          }
        );
        return plainContextPermissions;
      });
  }

  public async getPermission(
    context: ContextInstance,
    user?: string
  ): Promise<TypePermission> {
    if (user && context.owner === user) {
      return TypePermission.write;
    }

    if (!user) {
      if ((Scope[context.scope] as any) === Scope.public) {
        return TypePermission.read;
      } else {
        return TypePermission.null;
      }
    }

    if ((Scope[context.scope] as any) === Scope.private) {
      return TypePermission.null;
    }

    return await this.getPermissionFromProfils(context, user);
  }

  public async getPermissionByContextId(
    contextId: string,
    user?: string
  ): Promise<TypePermission> {
    let where: any = { id: contextId };

    if (isNaN(<number>(<any>contextId))) {
      where = { uri: contextId };
    }
    const context = await this.database.context.findOne({
      where: where
    });

    if (!context) {
      return TypePermission.null;
    }
    return await this.getPermission(context, user);
  }

  private async getPermissionFromProfils(
    context: ContextInstance,
    user?: string
  ): Promise<TypePermission> {
    const profils: string[] = await UserApi.getProfils(user).catch(() => {
      return [];
    });
    if (user) {
      profils.push(user);
    }
    const contextFound: any = await this.database.context.findAll({
      include: [
        {
          model: this.database.contextPermission,
          where: {
            profil: profils
          }
        }
      ],
      where: {
        id: context.id
      }
    });

    if (!contextFound.length) {
      if ((Scope[context.scope] as any) === Scope.public) {
        return TypePermission.read;
      } else {
        return TypePermission.null;
      }
    }

    let permission: TypePermission = TypePermission.read;
    for (const cp of contextFound[0].contextPermissions) {
      const typePerm: any = TypePermission[cp.typePermission];
      if (typePerm === TypePermission.write) {
        permission = TypePermission.write;
        break;
      }
    }
    return permission;
  }
}
