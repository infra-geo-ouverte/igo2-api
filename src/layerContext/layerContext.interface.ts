import { SourceOptions, LayerOptions } from '../layer';

export interface ILayerContext {
  id?: string;
  layerId: string;
  contextId: number;
  layerOptions?: LayerOptions;
  sourceOptions?: SourceOptions;
}
