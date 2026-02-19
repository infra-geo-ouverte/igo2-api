import { contextLayerModel } from '.';
import {
  ILayer,
  LayerGroupOptions,
  LayerOptions,
  SourceOptions
} from '../../layer';

export interface IContextLayerWithRelations extends IContextLayer {
  layer: ILayer | null;
}

export interface IContextLayer<T = IAnyContextLayerOptions> extends Omit<
  typeof contextLayerModel.$inferSelect,
  'layerOptions'
> {
  layerOptions: T | null;
}

export type IContextLayerWithoutMeta = Omit<
  IContextLayer,
  'createdAt' | 'updatedAt'
>;

export type IContextLayerIn = Omit<IContextLayerWithoutMeta, 'id'>;

export type IAnyContextLayerOptions =
  | IContextLayerGroupOptions
  | IContextLayerOptions;

export type IContextLayerGroupOptions = Omit<LayerGroupOptions, 'children'>;
export type IContextLayerOptions = Omit<LayerOptions, 'title'>;

export type IContextLayerSourceOptions = Omit<
  SourceOptions,
  'type' | 'url' | 'params'
>;

export interface IContextLayerWithId extends Omit<IContextLayer, 'id'> {
  id: number;
}

// The second parameter is a boolean to indicate if is created else false is updated
export type IUpsertResponse = [IContextLayer, boolean | null];
