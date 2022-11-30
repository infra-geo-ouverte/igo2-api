import * as Boom from '@hapi/boom';

import { ObjectUtils } from '@igo2/base-api';
import { UserApi } from '../user';
import { Context, Scope } from '../context';

import { IContextPermission, ContextPermission, TypePermission } from './index';

export class ContextPermissionService {
  public async create (contextPermission: IContextPermission): Promise<ContextPermission[]> {
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

    return await ContextPermission.bulkCreate(bulkData, {
      individualHooks: true
    }).catch((error) => {
      if (error?.data?.name === 'SequelizeUniqueConstraintError') {
        const message = 'The pair contextId and profil must be unique.';
        throw Boom.conflict(message);
      }
      if (Boom.isBoom(error)) {
        throw error;
      }
      throw Boom.badImplementation(error);
    });
  }

  public async update (id: string, contextPermission: IContextPermission): Promise<{ id: string }> {
    return await ContextPermission.update(contextPermission, {
      where: {
        id: id
      }
    })
      .then((count: [number]) => {
        if (!count[0]) {
          throw Boom.notFound();
        }
        return { id: id };
      })
      .catch((error) => {
        if (error?.data?.name === 'SequelizeUniqueConstraintError') {
          const message = 'The pair contextId and profil must be unique.';
          throw Boom.conflict(message);
        }
        if (Boom.isBoom(error)) {
          throw error;
        }
        throw Boom.badImplementation(error);
      });
  }

  public async delete (id: string): Promise<void> {
    return await ContextPermission.destroy({
      where: {
        id: id
      }
    }).then((count: number) => {
      if (!count) {
        throw Boom.notFound();
      }
    });
  }

  public async getById (id: string): Promise<ContextPermission> {
    return await ContextPermission.findOne({
      where: {
        id: id
      }
    }).then((permission: ContextPermission) => {
      if (!permission) {
        throw Boom.notFound();
      }
      return ObjectUtils.removeNull(permission.get());
    });
  }

  public async getByContextId (contextId): Promise<ContextPermission[]> {
    return await ContextPermission.findAll({
      where: {
        contextId: contextId
      }
    }).then((contextPermissions: ContextPermission[]) => {
      const plainContextPermissions = contextPermissions.map((contextPermission) => {
        return ObjectUtils.removeNull(contextPermission.get());
      });
      return plainContextPermissions;
    });
  }

  public async getPermission (context: Context, user?: string): Promise<TypePermission> {
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

  public async getPermissionByContextId (contextId: string, user?: string): Promise<TypePermission> {
    let where: any = { id: contextId };

    if (isNaN(contextId as any)) {
      where = { uri: contextId };
    }

    const context = await Context.findOne({
      where: where
    });

    if (!context) {
      return TypePermission.null;
    }
    return await this.getPermission(context, user);
  }

  private async getPermissionFromProfils (context: Context, user?: string): Promise<TypePermission> {
    const profils: string[] = await UserApi.getProfils(user).catch(() => {
      return [];
    });
    if (user) {
      profils.push(user);
    }
    const contextFound: any = await Context.findAll({
      include: [
        {
          // @ts-ignore
          model: ContextPermission,
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
