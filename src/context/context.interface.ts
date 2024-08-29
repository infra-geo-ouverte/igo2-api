import { TypePermission } from '../contextPermission';
import { ILayer, LayerOptions } from '../layer';
import { ITool } from '../tool';

export enum Scope {
  public,
  protected,
  private
}

interface Map {
  view: {
    center: [number, number];
    zoom: number;
    projection: string;
    maxZoomOnExtent?: number;
  };
}

export interface IContext {
  id?: number;
  uri: string;
  scope: Scope;
  title: string;
  icon: string;
  map: Map;
  owner: string;
  permission?: TypePermission | string;
}

export interface ContextDetailed extends IContext {
  tools?: ITool[];
  layers?: ILayer[];
  toolbar?: string[];
}

export interface IContextOut extends IContext {
  id: number;
}

export interface ContextDetailedOut extends IContext {
  id: number;
  tools?: ITool[];
  layers?: LayerOptions[];
  toolbar?: string[];
}
