import { OgcFiltersOptions } from './filter/layer-filter.interface';

export interface SourceOptions {
  type?: string;
  url?: string;
  version?: string;
  urlWfs?: string;
  optionsFromCapabilities?: boolean;
  params: Partial<AnySourceOptionsParams>;
  paramsWFS?: WFSDataSourceOptionsParams;
  ogcFilters?: OgcFiltersOptions;
}

export type AnyLayerOptionsOut = (LayerOptions | LayerGroupOptions) & { id: number };
export type AnyLayerOptionsWithLayerId = (LayerOptions & { layerId: number }) | LayerGroupOptions;
export type AnyLayerOptions = LayerOptions | LayerGroupOptions;
export type AnyLayerOptionsWithoutSource = Omit<LayerOptions, 'sourceOptions'> | LayerGroupOptions;

export interface LayerOptions extends BaseLayerOptions {
  baseLayer?: boolean;
  workspace?: WorkspaceOptions;
  sourceOptions?: SourceOptions;
}

export interface LayerGroupOptions extends Omit<BaseLayerOptions, 'title'> {
  type: 'group';
  title: string;
  collapsed?: boolean;
  children?: AnyLayerOptions[];
}

export interface BaseLayerOptions {
  id?: number;
  type?: LayerType;
  name?: string;
  title?: string;
  opacity?: number;
  visible?: boolean;
  extent?: [number, number, number, number];
  zIndex?: number;
  minResolution?: number;
  maxResolution?: number;
  showInLayerList?: boolean;
  parentId?: string;
}

export type LayerType =
  | 'group'
  | 'wms'
  | 'wfs'
  | 'vector'
  | 'wmts'
  | 'xyz'
  | 'osm'
  | 'tiledebug'
  | 'carto'
  | 'arcgisrest'
  | 'imagearcgisrest'
  | 'tilearcgisrest'
  | 'websocket'
  | 'mvt'
  | 'cluster';

export interface ILayer {
  id: number;
  type: LayerType;
  url?: string;
  layers?: string;
  global?: boolean;
  layerOptions?: AnyLayerOptionsWithoutSource;
  sourceOptions?: SourceOptions;
}

export type ILayerIn = Omit<ILayer, 'id'>;

interface WorkspaceOptions {
  srcId?: string;
  workspaceId?: string;
  minResolution?: number;
  maxResolution?: number;
  enabled?: boolean;
  queryOptions?: WorkspaceQueryOptions;
  pageSize?: number;
  pageSizeOptions?: number[];
  searchIndexEnabled?: boolean;
  printable?: boolean;
}

interface WorkspaceQueryOptions {
  mapQueryOnOpenTab?: boolean;
  tabQuery?: boolean;
}

export type AnySourceOptionsParams = WFSDataSourceOptionsParams | WMSDataSourceOptionsParams;

interface WFSDataSourceOptionsParams {
  version?: string;
  featureTypes: string;
  fieldNameGeometry: string;
  maxFeatures?: number;
  outputFormat: string;
  outputFormatDownload?: string;
  srsName?: string;
  xmlFilter?: string;
  layers?: string;
}

interface WMSDataSourceOptionsParams {
  LAYERS: string;
  layers: string;
  VERSION?: string;
  TIME?: string;
  FEATURE_COUNT?: number;
  FILTER?: string;
  INFO_FORMAT?: string;
  DPI?: number;
  MAP_RESOLUTION?: number;
  FORMAT_OPTIONS?: string;
  STYLES?: string
}
