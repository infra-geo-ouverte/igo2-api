export interface IUser {
  id: string;
  source: string;
  sourceId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  isAdmin?: boolean;
}
