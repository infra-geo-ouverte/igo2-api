export interface IUserIgo {
  id?: string;
  userId?: string;
  defaultContextId?: string;
  preference?: {
    [key: string]: any;
  };
  profils?: string;
}
