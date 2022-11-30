import { SourceOptions, LayerOptions } from '../layer';

export interface ILayerContext {
  id?: string;
  layerId?: string;
  enabled?: boolean;
  contextId?: string;
  layerOptions?: LayerOptions;
  sourceOptions?: SourceOptions;
}
