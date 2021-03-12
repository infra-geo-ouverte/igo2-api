import { SourceOptions, LayerOptions } from '../layer';

export interface ILayerContext {
  id?: string;
  layerId?: string;
  contextId?: string;
  layerOptions?: LayerOptions;
  sourceOptions?: SourceOptions;
}
