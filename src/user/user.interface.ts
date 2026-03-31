import { IProfils } from '../auth';
import { userModel } from './user.model';

export type IUser = typeof userModel.$inferSelect;

export type IUserIn = Omit<
  typeof userModel.$inferInsert,
  'createdAt' | 'updatedAt'
>;

export interface IUserWithProfils extends IUser {
  profils: IProfils;
}

export interface IUserWithPermission extends IUser {
  guides?: string[];
}

export type IUserPreference = Record<string, unknown>;
