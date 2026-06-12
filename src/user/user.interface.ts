import { IProfils } from '../auth';
import { IConsumerSource } from '../auth/authentication/shared/consumer';
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

export const UserSource = ['user', 'system'] as const satisfies Exclude<
  IConsumerSource,
  'anonymous'
>[];
export type UserSource = (typeof UserSource)[number];
