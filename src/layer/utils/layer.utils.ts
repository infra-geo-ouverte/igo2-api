import { IContextLayer } from '../../context/layer';
import {
  AnyLayerOptions,
  AnyLayerOptionsOut,
  ILayer,
  LayerGroupOptions,
  LayerOptions,
  SourceOptions
} from '../layer.interface';

export function isLayerGroupOptions(
  option: AnyLayerOptions
): option is LayerGroupOptions {
  return (option as LayerGroupOptions).type === 'group';
}

export function isLayerItemOptions(
  options: AnyLayerOptions
): options is LayerOptions {
  return (options as LayerOptions).sourceOptions != null;
}

export function convertLayerToOptions(layer: ILayer): AnyLayerOptionsOut {
  const { type, url, sourceOptions, layers, layerOptions, ...restLayer } =
    layer;

  const options: AnyLayerOptionsOut = {
    ...restLayer,
    ...layerOptions,
    type,
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

  if (isLayerItemOptions(options) && options.sourceOptions) {
    options.sourceOptions.optionsFromCapabilities = true;
  }

  return options;
}

export function convertLayerContextToOptions(
  layer: IContextLayer
): AnyLayerOptionsOut {
  const {
    id,
    layerId: _layerId,
    sourceOptions,
    contextId,
    createdAt,
    updatedAt,
    layerOptions,
    ...restLayer
  } = layer;

  const options: AnyLayerOptionsOut = {
    ...restLayer,
    ...layerOptions,
    id: id!,
    sourceOptions: sourceOptions
      ? formatSourceOptionsFromLayer(sourceOptions)
      : undefined
  };

  if (isLayerGroupOptions(options) || !options.sourceOptions) {
    delete options['sourceOptions'];
  }

  return options;
}

export function formatSourceOptionsFromLayer(
  options: Partial<SourceOptions>
): SourceOptions {
  return {
    ...(options ?? {}),
    params: {
      ...(options?.params ?? {})
    }
  } as SourceOptions;
}

export function getParamsLayers(options: SourceOptions): string | undefined {
  return options.params?.layers ?? options.params?.['LAYERS'] ?? undefined;
}

/** Recursive */
export function sortLayersByZindex(
  layers: AnyLayerOptions[]
): AnyLayerOptions[] {
  return layers
    .map((layer) => {
      if (isLayerGroupOptions(layer)) {
        sortLayersByZindex(layer.children ?? []);
      }
      return layer;
    })
    .sort(compareZindex);
}

export function compareZindex(a: AnyLayerOptions, b: AnyLayerOptions): number {
  const aZ = a.zIndex ?? 0;
  const bZ = b.zIndex ?? 0;
  return aZ < bZ ? -1 : aZ > bZ ? 1 : 0;
}
