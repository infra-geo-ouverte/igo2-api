import { SourceOptions, AnyLayerOptionsWithoutSource, ILayer } from '../layer';

export interface ILayerWithContext extends ILayer {
  id: number;
  LayerContext?: ILayerContext
}

export interface ILayerContext {
  id?: number;
  layerId?: number;
  contextId: number;
  layerOptions?: AnyLayerOptionsWithoutSource;
  sourceOptions?: Partial<SourceOptions>;
}
