import { IUser } from '../user';

export interface UserWithCredentials extends IUser {
  username: string;
  password: string;
  profils?: [],
  expiresIn?: string;
}

export interface IgoJWTUser {
  user: IUser;
}
