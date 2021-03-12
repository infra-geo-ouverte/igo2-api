export interface SourceOptions {
  version?: string;
  params?: { [key: string]: any };
  [key: string]: any;
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
  type?: string;
  url?: string;
  layers?: string;
  global?: boolean;
  layerOptions?: LayerOptions;
  sourceOptions?: SourceOptions;
}
