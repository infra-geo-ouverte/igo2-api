import { ILayerContext } from '../layerContext';
import {
  AnyLayerOptions,
  AnyLayerOptionsOut,
  ILayer,
  LayerGroupOptions,
  LayerOptions,
  SourceOptions
} from './layer.interface';

export function isLayerGroupOptions(option: AnyLayerOptions): option is LayerGroupOptions {
  return (option as LayerGroupOptions).type === 'group';
}

export function isLayerItemOptions(options: AnyLayerOptions): options is LayerOptions {
  return (options as LayerOptions).sourceOptions != null;
}

export function convertLayerToOptions(layer: ILayer): AnyLayerOptionsOut {
  const { type, url, sourceOptions, layers, layerOptions, ...restLayer } = layer;

  const options = {
    ...restLayer,
    ...layerOptions,
    sourceOptions: formatSourceOptionsFromLayer({
      ...sourceOptions,
      type,
      url,
      params: {
        layers,
        ...(sourceOptions?.params ?? {})
      }
    })
  };

  if (isLayerGroupOptions(options)) {
    delete options['sourceOptions'];
  }

  if (isLayerItemOptions(options)) {
    options.sourceOptions.optionsFromCapabilities = true;
  }

  return options;
}

export function convertLayerContextToOptions(layer: ILayerContext): AnyLayerOptionsOut {
  const {
    id,
    layerId,
    sourceOptions,
    contextId,
    createdAt = null,
    updatedAt = null,
    layerOptions,
    ...restLayer
  } = layer;

  const options = {
    ...restLayer,
    ...layerOptions,
    id,
    sourceOptions: formatSourceOptionsFromLayer(sourceOptions)
  };

  if (isLayerGroupOptions(options)) {
    delete options['sourceOptions'];
  }

  return options;
}

export function formatSourceOptionsFromLayer(options: Partial<SourceOptions>): SourceOptions {
  return {
    ...(options ?? {}),
    params: {
      ...(options?.params ?? {})
    }
  };
}

export function getParamsLayers(options: SourceOptions): string | undefined {
  return options.params?.layers ?? options.params?.['LAYERS'];
}