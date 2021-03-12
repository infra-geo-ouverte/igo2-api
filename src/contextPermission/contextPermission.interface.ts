export enum TypePermission {
  null,
  read,
  write
}

export interface IContextPermission {
  id?: string;
  typePermission: TypePermission;
  profil: string;
  contextId: string;
}
