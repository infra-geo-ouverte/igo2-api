export interface SourceOptions {
  type: string;
  url: string;
  version?: string;
  params?: { [key: string]: any };
  paramsWFS?: { [key: string]: any };
  ogcFilters?: { [key: string]: any };
  crossOrigin?: string;
  optionsFromCapabilities?: boolean;
  optionsFromApi?: boolean;
  queryable?: boolean;
  queryTitle?: string;
  timeFilterable?: boolean;
  timeFilter?: { [key: string]: any };
}

export interface LayerOptions {
  title?: string;
  baseLayer?: boolean;
  opacity?: number;
  visible?: boolean;
  extent?: [number, number, number, number];
  zIndex?: number;
  minResolution?: number;
  maxResolution?: number;
  [key: string]: any;
}

export interface ILayer {
  id?: string;
  enabled?: boolean;
  type?: string;
  url?: string;
  layers?: string;
  global?: boolean;
  layerOptions?: LayerOptions;
  sourceOptions?: SourceOptions;
  profils?: string;
  searchableColumn?: string;
}
