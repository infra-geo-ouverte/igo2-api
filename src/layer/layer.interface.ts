import { layerModel } from './layer.model';
import { OgcFiltersOptions } from './utils/filter/layer-filter.interface';

export type ILayer = typeof layerModel.$inferSelect;

export type ILayerIn = Omit<
  typeof layerModel.$inferInsert,
  'createdAt' | 'updatedAt'
>;

export interface SourceOptions {
  type: LayerType;
  url: string;
  version?: string;
  urlWfs?: string;
  optionsFromCapabilities?: boolean;
  params?: Partial<AnySourceOptionsParams>;
  paramsWFS?: WFSDataSourceOptionsParams;
  ogcFilters?: OgcFiltersOptions;
  sourceFields?: SourceFieldsOptionsParams[];
  [key: string]: unknown;
}

export type LayerSourceOptions = Omit<SourceOptions, 'type' | 'url'>;

export type AnyLayerOptionsOut = (LayerOptions | LayerGroupOptions) & {
  id: number;
};
export type AnyLayerOptionsWithLayerId =
  | (LayerOptions & { layerId: number })
  | LayerGroupOptions;
export type AnyLayerOptions = LayerOptions | LayerGroupOptions;
export type AnyLayerOptionsWithoutSource =
  | Omit<LayerOptions, 'sourceOptions'>
  | LayerGroupOptions;

export interface LayerOptions extends BaseLayerOptions {
  baseLayer?: boolean;
  workspace?: WorkspaceOptions;
  sourceOptions?: SourceOptions;
  legendOptions?: unknown;
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
  metadata?: unknown;
}

export const LayerType = [
  'group',
  'wms',
  'wfs',
  'vector',
  'wmts',
  'xyz',
  'osm',
  'tiledebug',
  'carto',
  'arcgisrest',
  'imagearcgisrest',
  'tilearcgisrest',
  'websocket',
  'mvt',
  'cluster'
] as const;
export type LayerType = (typeof LayerType)[number];

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

export type AnySourceOptionsParams =
  | WFSDataSourceOptionsParams
  | WMSDataSourceOptionsParams;

interface WFSDataSourceOptionsParams {
  version?: string;
  featureTypes: string;
  fieldNameGeometry: string;
  maxFeatures?: number;
  outputFormat: string;
  outputFormatDownload?: string;
  srsName?: string;
  xmlFilter?: string;
  layers?: string | null;
  LAYERS?: string | null;
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
  STYLES?: string;
}

export interface SourceFieldsOptionsParams {
  name: string;
  alias?: string;
  values?: string[];
  [key: string]: unknown;
}

type ILayerMigrateUpdate = { id: ILayerIn['id'] } & Partial<
  Pick<ILayerIn, 'layerOptions' | 'sourceOptions'>
>;

export interface ILayerMigrateBatch {
  toAdd?: ILayerIn[];
  toPut?: ILayerMigrateUpdate[];
}
