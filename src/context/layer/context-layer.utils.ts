import { ObjectUtils } from '@igo2/base-api';
import isEqual from 'lodash/isEqual.js';

import {
  AnyBaseOgcFilterOptions,
  AnyLayerOptionsOut,
  LayerOptions,
  LogicalArrayOptions,
  OgcFiltersOptions,
  OgcInterfaceFilterOptions,
  OgcPushButton,
  OgcSelector,
  OgcSelectorBundle,
  OgcSelectorFields,
  Selector,
  SelectorGroup,
  SourceFieldsOptionsParams,
  SourceOptions,
  convertLayerContextToOptions,
  convertLayerToOptions,
  isLayerGroupOptions,
  isOgcFilterDuringOptions,
  isOgcPushButton,
  searchFilter
} from '../../layer';
import { IContextLayerWithRelations } from './context-layer.interface';

export function mergeLayerContext(
  ctxLayer: IContextLayerWithRelations
): AnyLayerOptionsOut {
  const { layer, ...restContextLayer } = ctxLayer;
  const ctxLayerOptions = convertLayerContextToOptions(restContextLayer);
  if (!layer) {
    return ctxLayerOptions;
  }

  const baseOptions: LayerOptions = convertLayerToOptions(layer);
  const { sourceOptions } = baseOptions;

  if (!sourceOptions) {
    return baseOptions as AnyLayerOptionsOut;
  }

  if (isLayerGroupOptions(ctxLayerOptions)) {
    return baseOptions as AnyLayerOptionsOut;
  }

  const processedContextOptions = { ...ctxLayerOptions };
  const contextOgcFilters = processedContextOptions.sourceOptions?.ogcFilters;

  if (contextOgcFilters) {
    if (sourceOptions.ogcFilters) {
      processedContextOptions.sourceOptions!.ogcFilters = mergeOgcFilterOptions(
        contextOgcFilters,
        sourceOptions
      );
    } else if (!sourceOptions.sourceFields?.length) {
      delete processedContextOptions.sourceOptions!.ogcFilters;
    }
  }

  return ObjectUtils.mergeDeep(
    baseOptions,
    processedContextOptions
  ) as AnyLayerOptionsOut;
}

function mergeOgcFilterOptions(
  contextOgcFilters: OgcFiltersOptions,
  sourceOptions: SourceOptions
): OgcFiltersOptions {
  const { ogcFilters: sourceOgcFilters, sourceFields } = sourceOptions;

  const mergedFilters = sourceOgcFilters
    ? mergeOgcFilter(sourceOgcFilters, contextOgcFilters)
    : { ...contextOgcFilters };

  if (mergedFilters.interfaceOgcFilters && sourceFields?.length) {
    const advancedFilters = mergeAdvancedOgcFilters(
      sourceFields,
      mergedFilters.interfaceOgcFilters
    );

    mergedFilters.interfaceOgcFilters = [
      ...mergedFilters.interfaceOgcFilters,
      ...advancedFilters
    ];
  }

  return mergedFilters;
}

function mergeOgcFilter(
  layerOgcFilters: OgcFiltersOptions,
  contextOgcFilters: OgcFiltersOptions
): OgcFiltersOptions {
  const ogcFilters: OgcFiltersOptions = { ...layerOgcFilters };

  OgcSelectorFields.forEach((selectorField) => {
    const layerSelector = layerOgcFilters[selectorField];
    const contextSelector = contextOgcFilters[selectorField];

    if (layerSelector && contextSelector) {
      const groups = compareOgcSelectorFields(layerSelector, contextSelector);
      if (groups.length > 0) {
        ogcFilters[selectorField] = {
          ...ogcFilters[selectorField],
          groups
        };
      }
    }
  });

  if (contextOgcFilters.interfaceOgcFilters && layerOgcFilters.filters) {
    const mergedInterfaces = mergeOgcInterface(
      contextOgcFilters.interfaceOgcFilters,
      layerOgcFilters.filters
    );
    if (mergedInterfaces.length > 0) {
      ogcFilters.interfaceOgcFilters = mergedInterfaces;
    }
  }

  return ogcFilters;
}

function compareOgcSelectorFields(
  layerSelector: OgcSelector,
  contextSelector: OgcSelector
): SelectorGroup[] {
  return contextSelector.groups
    .map((group) => mergeOgcSelectorField(layerSelector, group))
    .filter((g): g is SelectorGroup => !!g);
}

function mergeOgcSelectorField(
  layerSelector: OgcSelector,
  contextGroup: SelectorGroup
): SelectorGroup | undefined {
  const group = layerSelector.groups.find((g) => g.name === contextGroup.name);
  if (!group?.ids) return undefined;

  const contextBundles = (contextGroup.computedSelectors ?? [])
    .filter((selector) => group.ids!.includes(selector.id))
    .map((bundle) => mergeSelectorBundle(layerSelector, bundle))
    .filter((b): b is OgcSelectorBundle => !!b);

  const missingBundles = (layerSelector.bundles ?? []).filter(
    (lb) =>
      !contextBundles.some((cb) => cb.id === lb.id) &&
      group.ids!.includes(lb.id)
  );

  return {
    ...contextGroup,
    ...group,
    computedSelectors: [...contextBundles, ...missingBundles]
  };
}

function mergeSelectorBundle(
  layerSelector: OgcSelector,
  contextBundle: OgcSelectorBundle
): OgcSelectorBundle | undefined {
  const layerBundle = layerSelector.bundles?.find(
    (b) => b.id === contextBundle.id
  );
  if (!layerBundle) return undefined;

  const selectorBundle: OgcSelectorBundle = {
    ...contextBundle,
    ...layerBundle
  };

  if (layerBundle.domSelectors?.length) {
    selectorBundle.selectors = contextBundle.selectors?.filter(
      (s) => s.enabled
    );
  } else {
    selectorBundle.selectors = layerBundle.selectors?.map((lb) => {
      const cb = contextBundle.selectors?.find((s) => s.title === lb.title);
      return cb ? mergeSelectorProperties(lb, cb) : lb;
    });
  }

  return selectorBundle;
}

function mergeSelectorProperties(
  layerSelector: Selector | OgcPushButton,
  contextSelector: Selector | OgcPushButton
): Selector | OgcPushButton {
  const field = { ...layerSelector, ...contextSelector };

  if (isOgcPushButton(layerSelector) && isOgcPushButton(field)) {
    field.color = layerSelector.color;
  }

  if (!isEqual(field.filters, layerSelector.filters)) {
    field.filters = layerSelector.filters;
  }

  return field;
}

function mergeOgcInterface(
  contextInterfaceOgcFilters: OgcInterfaceFilterOptions[],
  layerOgcFilters: LogicalArrayOptions | AnyBaseOgcFilterOptions
): OgcInterfaceFilterOptions[] {
  return contextInterfaceOgcFilters
    .map((interfaceFilter) => {
      const layerFilter = searchFilter(
        layerOgcFilters,
        interfaceFilter.propertyName
      );
      if (!layerFilter) return null;

      const updated = { ...interfaceFilter };
      if (isOgcFilterDuringOptions(layerFilter)) {
        if (!updated.begin && !isEmpty(layerFilter.begin))
          updated.begin = layerFilter.begin;
        if (!updated.end && !isEmpty(layerFilter.end))
          updated.end = layerFilter.end;
        if (!isEmpty(layerFilter.step)) updated.step = layerFilter.step;
      }
      return updated;
    })
    .filter((f): f is OgcInterfaceFilterOptions => !!f);
}

function mergeAdvancedOgcFilters(
  layerSourceFields: SourceFieldsOptionsParams[],
  interfaceOgcFilters: OgcInterfaceFilterOptions[]
): OgcInterfaceFilterOptions[] {
  return interfaceOgcFilters.filter((io) =>
    layerSourceFields.some((field) => field.name === io.propertyName)
  );
}

function isEmpty(value: string | undefined): boolean {
  return value === null || value === undefined || value === '';
}
