import { IProfil, ProfilType } from '../../profil';
import { IUser } from '../../user';
import { contextPermissionModel } from './context-permission.model';

export const TypePermission = ['read', 'write'] as const;
export type TypePermission = (typeof TypePermission)[number];

export type IContextPermission = typeof contextPermissionModel.$inferSelect;
export type IContextPermissionIn = typeof contextPermissionModel.$inferSelect;

export type IAnyContextPermissionWithRelations =
  | IContextPermissionWithUser
  | IContextPermissionWithProfil;

export type IAnyContextPermissionOut = (
  | IContextPermissionWithUser
  | IContextPermissionProfil
) & {
  title?: string;
  profilType: ProfilType;
};

export type IAnyContextPermission =
  | IContextPermissionProfil
  | IContextPermissionUser;

export type IAnyContextPermissionIn =
  | IContextPermissionUserIn
  | IContextPermissionProfilIn;

export type IContextPermissionUserIn = Omit<
  IContextPermissionUser,
  'id' | 'createdAt' | 'updatedAt' | 'userId'
> & {
  userExternalId: string;
  userId?: IContextPermissionProfil['userId'] | null;
  contextId?: IContextPermissionProfil['contextId'];
};

export type IContextPermissionProfilIn = Omit<
  IContextPermissionProfil,
  'id' | 'createdAt' | 'updatedAt' | 'userId'
> & {
  contextId?: IContextPermissionProfil['contextId'];
};

export interface IContextPermissionUser extends Omit<
  IContextPermission,
  'profilId'
> {
  userId: NonNullable<IContextPermission['userId']>;
  profilId?: number | null;
}

export type IContextPermissionWithUser = IContextPermissionUser & {
  user: IUser;
  profil?: null;
};

export interface IContextPermissionProfil extends Omit<
  IContextPermission,
  'userId'
> {
  profilId: NonNullable<IContextPermission['profilId']>;
  userId?: number | null;
}

export type IContextPermissionWithProfil = IContextPermissionProfil & {
  profil: IProfil;
  user?: null;
};
