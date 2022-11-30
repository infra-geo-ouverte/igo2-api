import { TypePermission } from '../contextPermission';

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
  id?: string;
  uri: string;
  scope: Scope;
  title: string;
  icon: string;
  map: Map;
  owner: string;
  permission?: TypePermission | string;
}

export interface ContextDetailed extends IContext {
  tools?: any[];
  layers?: any[];
  toolbar?: string[];
}
