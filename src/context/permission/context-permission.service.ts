import { DrizzleQueryError, SQL, and, eq, inArray, or } from 'drizzle-orm';

import { AppDatabase, AppInstance } from '../../app.interface';
import { IProfils } from '../../auth';
import { ProfilService, profilModel } from '../../profil';
import { UserService, userModel } from '../../user';
import { IUser, IUserWithProfils } from '../../user/user.interface';
import { IContext } from '../context.interface';
import {
  IAnyContextPermissionIn,
  IAnyContextPermissionOut,
  IAnyContextPermissionWithRelations,
  IContextPermissionProfil,
  IContextPermissionProfilIn,
  IContextPermissionUserIn,
  IContextPermissionWithProfil,
  IContextPermissionWithUser,
  TypePermission
} from './context-permission.interface';
import { contextPermissionModel } from './context-permission.model';

export class ContextPermissionService {
  private profilService: ProfilService;
  private userService: UserService;
  private db: AppDatabase;

  constructor(private app: AppInstance) {
    this.profilService = new ProfilService(app);
    this.userService = new UserService(app);
    this.db = app.db;
  }

  async create(
    contextPermission: IAnyContextPermissionIn,
    user: IUserWithProfils
  ): Promise<IAnyContextPermissionOut> {
    if (isContextPermissionProfilIn(contextPermission)) {
      await this.verifyPermissionsForProfil(contextPermission, user);
    } else if (isContextPermissionUserIn(contextPermission)) {
      const { userExternalId } = contextPermission;
      // L'utilisateur peut ne pas exister dans la table USER s'il ne s'est jamais connecté
      // il est important de conserver le getOrCreate
      const userInternal =
        await this.userService.getOrCreateByExternalId(userExternalId);
      if (!userInternal) {
        throw this.app.httpErrors.badRequest(
          `The user with this external id ${userExternalId} doesn't exist`
        );
      }

      contextPermission.userId = userInternal.id;
    }

    try {
      const [reponse] = await this.db
        .insert(contextPermissionModel)
        .values(contextPermission)
        .returning();

      const newPermission = await this.getById(reponse.id);
      return newPermission!;
    } catch (error) {
      if (error instanceof DrizzleQueryError) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const code = (error?.cause as any)?.code;
        if (code === '23505') {
          const message = 'The pair contextId and profil must be unique.';
          throw this.app.httpErrors.conflict(message);
        }
      }
      throw error;
    }
  }

  async update(
    id: number,
    ctxPermission: IAnyContextPermissionIn,
    user: IUserWithProfils
  ): Promise<IAnyContextPermissionOut> {
    if (isContextPermissionProfilRelation(ctxPermission)) {
      await this.verifyPermissionsForProfil(ctxPermission, user);
    }
    try {
      const [result] = await this.db
        .update(contextPermissionModel)
        .set(ctxPermission)
        .where(eq(contextPermissionModel.id, id))
        .returning();

      const permission = await this.getById(result.id);
      return permission!;
    } catch (error) {
      if (error instanceof DrizzleQueryError) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const code = (error?.cause as any)?.code;
        if (code === '23505') {
          const message = 'The pair contextId and profil must be unique.';
          throw this.app.httpErrors.conflict(message);
        }
      }

      throw error;
    }
  }

  async delete(id: number): Promise<number> {
    const result = await this.db
      .delete(contextPermissionModel)
      .where(eq(contextPermissionModel.id, id));
    return result.rowCount ?? 0;
  }

  async getById(id: number): Promise<IAnyContextPermissionOut | undefined> {
    const permission = await this.db.query.contextPermission.findFirst({
      where: {
        id: id
      },
      with: {
        profil: true,
        user: true
      }
    });

    if (!permission) {
      return;
    }

    const permissions = await this.enrichPermissions([
      permission as IAnyContextPermissionWithRelations
    ]);
    return permissions[0];
  }

  async getAllByContextId(
    contextId: number,
    filters: {
      type: TypePermission | null;
      userId?: number;
      profilNames: string[];
    }
  ): Promise<IAnyContextPermissionWithRelations[]> {
    if (!filters.type) return [];

    const conditions: SQL[] = [eq(contextPermissionModel.contextId, contextId)];

    if (filters.type === 'read') {
      const orConditions: SQL[] = [];

      if (filters.userId !== undefined) {
        orConditions.push(eq(contextPermissionModel.userId, filters.userId));
      }

      if (filters.profilNames.length > 0) {
        orConditions.push(inArray(profilModel.name, filters.profilNames));
      }

      if (orConditions.length > 0) {
        conditions.push(or(...orConditions)!);
      } else {
        return [];
      }
    }

    const results = await this.db
      .select()
      .from(contextPermissionModel)
      .leftJoin(
        profilModel,
        eq(contextPermissionModel.profilId, profilModel.id)
      )
      .leftJoin(userModel, eq(contextPermissionModel.userId, userModel.id))
      .where(and(...conditions));

    return results.map((row) => {
      const cp = row.context_permission;
      return {
        ...cp,
        user: row.user,
        profil: row.profil
      } as IAnyContextPermissionWithRelations;
    });
  }

  async getTypePermission(
    context: IContext,
    user: IUserWithProfils | undefined
  ): Promise<TypePermission | null> {
    const scope = context.scope;
    if (!user) {
      if (scope === 'public') {
        return 'read';
      } else {
        return null;
      }
    }

    if (context.userId === user.id) {
      return 'write';
    }

    if (scope === 'private') {
      return null;
    }

    return this.getPermissionFromProfils(context, user.id, user.profils ?? []);
  }

  private async getPermissionFromProfils(
    context: IContext,
    userId: number,
    profils: IProfils
  ): Promise<TypePermission | null> {
    const permissions = await this.db
      .select()
      .from(contextPermissionModel)
      .where(
        and(
          eq(contextPermissionModel.contextId, context.id!),
          or(
            eq(contextPermissionModel.userId, userId),
            inArray(
              contextPermissionModel.profilId,
              this.db
                .select({ id: profilModel.id })
                .from(profilModel)
                .where(inArray(profilModel.name, profils))
            )
          )
        )
      );

    if (permissions.length === 0) {
      const scope = context.scope;
      if (scope === 'public') {
        return 'read';
      } else {
        return null;
      }
    }

    let permission: TypePermission = 'read';
    for (const cp of permissions) {
      const typePerm = cp.typePermission;
      if (typePerm === 'write') {
        permission = 'write';
        break;
      }
    }
    return permission;
  }

  private async verifyPermissionsForProfil(
    contextPermission: IContextPermissionProfil | IContextPermissionProfilIn,
    user: IUserWithProfils
  ) {
    const profil = await this.profilService.getById(contextPermission.profilId);
    if (!profil) {
      throw this.app.httpErrors.badRequest(
        `The profil ${contextPermission.profilId} doesn't exist`
      );
    }

    const { profils } = user;
    if (!profils) {
      throw this.app.httpErrors.forbidden(
        'You do not have permission on this context'
      );
    }

    const userProfils = await this.profilService.get();
    const profilIgo = userProfils.filter((p) => profils.includes(p.name));

    const canShare = profilIgo.find((p) => p.canShare === true);
    if (!canShare) {
      throw this.app.httpErrors.forbidden(
        'You do not have permission on this context'
      );
    }

    const canShareToProfils = [
      ...profilIgo.reduce(
        (accumulator: number[], p) =>
          accumulator.concat(p.canShareToProfils ?? []),
        []
      )
    ];

    const profilForbidden = profilIgo
      .filter((p) => !(p.id && canShareToProfils.includes(p.id)))
      .map((p) => p.name);
    if (profilForbidden.includes(profil.name)) {
      throw this.app.httpErrors.forbidden(
        'You can not share a context to this profile'
      );
    }
  }

  async enrichPermissions(
    permissions: IAnyContextPermissionWithRelations[]
  ): Promise<IAnyContextPermissionOut[]> {
    const profilePerms = permissions.filter(isContextPermissionProfilRelation);
    const userPerms = permissions.filter(
      (p) => !isContextPermissionProfilRelation(p)
    ) as IContextPermissionWithUser[];

    const enrichedProfiles = this.enrichProfils(profilePerms);
    const enrichedUsers = await this.enrichUsers(userPerms);

    return [...enrichedProfiles, ...enrichedUsers];
  }

  async enrichPermission(
    permission: IAnyContextPermissionWithRelations
  ): Promise<IAnyContextPermissionOut> {
    if (isContextPermissionProfilRelation(permission)) {
      return this.enrichProfil(permission);
    } else {
      return this.enrichUser(permission);
    }
  }

  private enrichProfils(
    ctxPermissions: IContextPermissionWithProfil[]
  ): IAnyContextPermissionOut[] {
    return ctxPermissions.map(this.enrichProfil);
  }
  private enrichProfil(
    ctxPermission: IContextPermissionWithProfil
  ): IAnyContextPermissionOut {
    return {
      ...ctxPermission,
      title: ctxPermission.profil.title,
      profilType: 'profil'
    };
  }

  private async enrichUsers(
    ctxPermissions: IContextPermissionWithUser[]
  ): Promise<IAnyContextPermissionOut[]> {
    const permissionUsers = ctxPermissions.filter(
      (userPerm) => userPerm.user.source === 'user'
    );
    const userExternalIds = permissionUsers.map((userPerm) =>
      Number(userPerm.user.externalId)
    );
    const authUsers = await this.app.authApi.findMany(userExternalIds);

    const authUserMap = new Map(authUsers.map((u) => [u.id, u]));
    return permissionUsers.map((userPerm) => {
      const externalUser = authUserMap.get(Number(userPerm.user.externalId));

      return {
        ...userPerm,
        title: externalUser
          ? `${externalUser.firstName} ${externalUser.lastName}`.trim()
          : 'System or Unknown User',
        profilType: 'user',
        userSource: externalUser?.source
      };
    });
  }

  private async enrichUser(
    ctxPermissions: IContextPermissionWithUser
  ): Promise<IAnyContextPermissionOut> {
    const title = await this.getUserTitle(ctxPermissions.user);
    return {
      ...ctxPermissions,
      title,
      profilType: 'user'
    };
  }
  private async getUserTitle(user: IUser): Promise<string> {
    if (user.source === 'system') {
      return `System:${user.id}`;
    }

    const authUsers = await this.app.authApi.findMany([
      Number(user.externalId)
    ]);
    const authUser = authUsers[0];

    return authUser
      ? `${authUser.firstName} ${authUser.lastName}`.trim()
      : 'Unknown User';
  }
}

function isContextPermissionProfilIn(
  permission: IAnyContextPermissionIn
): permission is IContextPermissionProfilIn {
  return (permission as IContextPermissionProfilIn).profilId != null;
}

function isContextPermissionUserIn(
  permission: IAnyContextPermissionIn
): permission is IContextPermissionUserIn {
  return (permission as IContextPermissionUserIn).userExternalId != null;
}

function isContextPermissionProfilRelation(
  permission: IAnyContextPermissionWithRelations | IAnyContextPermissionIn
): permission is IContextPermissionWithProfil {
  return (permission as IContextPermissionProfil).profilId != null;
}
