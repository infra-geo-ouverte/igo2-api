export interface IProcessChanges<T> {
  created: T[];
  updated: T[];
  deleted: number[];
}
