import { TypePermission } from '../contextPermission';
import { AnyLayerOptions, ILayer } from '../layer';
import { ILayerContext } from '../layerContext';
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
  /**
   * Layer temporaire par exemple les groupes, dessins, mesures
   * Cette propriété est seulement pour permettre l'aggrégation.
   **/
  layersSystem?: ILayerContext[];
  toolbar?: string[];
}

export interface IContextOut extends IContext {
  id: number;
}

export interface ContextDetailedIn extends Omit<ContextDetailed, 'layersSystem' | 'layers'> {
  layers?: AnyLayerOptions[];
}

export interface ContextDetailedDto extends Omit<ContextDetailed, 'layersSystem' | 'layers'> {
  id: number;
  layers?: AnyLayerOptions[];
}
