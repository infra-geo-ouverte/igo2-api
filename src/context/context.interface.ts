import { AnyLayerOptions } from '../layer';
import { ITool, IToolIn } from '../tool';
import { IProcessChanges } from '../utils/request';
import { contextModel } from './context.model';
import { IContextHidden } from './hidden';
import { IContextLayer } from './layer';
import {
  IContextPermission,
  TypePermission
} from './permission/context-permission.interface';
import { IContextTool } from './tool';

export const Scope = ['public', 'protected', 'private'] as const;
export type Scope = (typeof Scope)[number];

export interface IMap {
  view: IMapView;
}

export interface IMapView {
  center: [number, number];
  zoom: number;
  projection: string;
  maxZoomOnExtent?: number;
}

export type IContext = typeof contextModel.$inferSelect;

export type IContextIn = Omit<
  typeof contextModel.$inferInsert,
  'id' | 'createdAt' | 'updatedAt'
>;

export interface IContextOut extends IContext {
  id: number;
  permission: TypePermission | null;
  hidden?: boolean;
}

export interface IContextWithRelations extends IContext {
  id: number;
  contextHiddens?: IContextHidden[];
  contextPermissions?: IContextPermission[];
  contextLayers?: IContextLayer[];
  contextTools?: IContextTool[];
}

export interface IContextDetailed extends IContext, IContextDetailedBase {}

export interface IContextDetailedIn
  extends
    Omit<IContextDetailedBase, 'layers' | 'permission' | 'hidden' | 'tools'>,
    IContextIn {
  layers?: AnyLayerOptions[];
  tools?: IToolIn[];
  userId?: IContext['userId'];
}

interface IContextDetailedBase {
  tools?: ITool[];
  toolbar?: string[];
  layers?: AnyLayerOptions[];
  permission: TypePermission | null;
  hidden?: boolean;
}

export type IContextDetailedUpdate = Omit<IContextDetailedIn, 'toolbar'>;

export interface IContextDetailedChanges extends Pick<IContextDetailed, 'id'> {
  layers: IProcessChanges<AnyLayerOptions>;
}

export interface IGetAllDetailledContext {
  ours: IContextDetailed[];
  shared: IContextDetailed[];
  public: IContextDetailed[];
}
