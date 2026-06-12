import { IContextLayer } from '../../context/layer';
import {
  AnyLayerOptions,
  AnyLayerOptionsOut,
  AnySourceOptionsParams,
  ILayer,
  LayerGroupOptions,
  LayerOptions,
  LayerSourceOptions,
  SourceOptions
} from '../layer.interface';

/**
 * Resolves a relative URL (starting with '/') to an absolute URL using the host of the provided WSS_API URL.
 * Returns the original URL unchanged if it is already absolute or if no base is provided.
 */
export function resolveUrl(url: string, wssApi?: string): string {
  if (url.startsWith('/') && wssApi) {
    const { origin } = new URL(wssApi);
    return `${origin}${url}`;
  }
  return url;
}

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

/**
 * Strips unique-key fields (type, url, params.layers/LAYERS) from a sourceOptions object
 * before persisting in the source_options JSON column. These values are already stored
 * in dedicated columns and must not be duplicated.
 */
export function sanitizeLayerSourceOptions(
  sourceOptions: Partial<SourceOptions>
): LayerSourceOptions {
  const { type: _type, url: _url, params, ...rest } = sourceOptions;
  const result: LayerSourceOptions = { ...rest };

  if (params) {
    const {
      layers: _layers,
      LAYERS: _LAYERS,
      ...remainingParams
    } = params as Record<string, unknown>;
    if (Object.keys(remainingParams).length > 0) {
      result.params = remainingParams as Partial<AnySourceOptionsParams>;
    }
  }

  return result;
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
