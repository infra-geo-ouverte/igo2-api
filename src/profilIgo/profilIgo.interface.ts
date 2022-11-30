export interface IProfilIgo {
  id?: number;
  name: string;
  title: string;
  group?: string;
  preference?: {
    [key: string]: any;
  };
  canShare?: boolean;
  canShareToProfils?: number[];
  canFilter?: boolean;
  guide?: string;
}

export interface IProfilIgoChilds {
  name: string;
  title: string;
  childs?: IProfilIgo[];
}
