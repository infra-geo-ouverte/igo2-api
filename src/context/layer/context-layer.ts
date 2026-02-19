import { AnyLayerOptions } from '../../layer/layer.interface';
import { LayerSourceKeys } from '../../layer/layer.service';
import { isLayerItemOptions } from '../../layer/utils/layer.utils';
import { excludeKeys } from '../../utils/object';
import { IContextLayerWithoutMeta } from './context-layer.interface';

export function parseLayerToContextLayer(
  { id, ...layer }: AnyLayerOptions,
  contextId: number,
  layerId?: number
): IContextLayerWithoutMeta {
  if (isLayerItemOptions(layer)) {
    const { sourceOptions, ...restLayer } = layer;
    // The type, url and params should not be saved for LayerContext
    const filteredSourceOptions = excludeKeys(sourceOptions!, LayerSourceKeys);
    const filteredLayerOptions = excludeKeys(restLayer, ['title']);

    const { params } = sourceOptions!;
    if (params && 'STYLES' in params) {
      filteredSourceOptions.params = {
        STYLES: params.STYLES
      };
    }

    return {
      id: id!,
      layerId: layerId ?? null,
      contextId,
      layerOptions: filteredLayerOptions,
      sourceOptions: filteredSourceOptions
    };
  } else {
    const filteredLayerOptions = excludeKeys(layer, ['children']);
    return {
      id: id!,
      layerId: null,
      contextId,
      layerOptions: filteredLayerOptions,
      sourceOptions: null
    };
  }
}
