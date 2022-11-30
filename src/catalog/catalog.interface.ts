export interface ICatalogOptions {
  regFilters: string[];
}

export interface ICatalog {
  id?: string;
  title: string;
  url: string;
  options?: ICatalogOptions;
  order?: number;
  profils?: string;
  [key: string]: any;
}
