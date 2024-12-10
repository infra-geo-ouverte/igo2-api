import { ObjectUtils } from '@igo2/base-api';
import { convertLayerContextToOptions, convertLayerToOptions, isLayerGroupOptions } from './layer.utils';
import { ILayerContext } from '../layerContext';
import isEqual from 'lodash/isEqual.js';

import { AnyLayerOptionsOut, ILayer, LayerOptions, SourceOptions } from '../layer';
import {
  OgcFiltersOptions,
  OgcSelectorFields,
  OgcSelector,
  OgcSelectorBundle,
  OgcInterfaceFilterOptions,
  LogicalArrayOptions,
  AnyBaseOgcFilterOptions,
  SelectorGroup,
  OgcPushButton,
  Selector
} from '../layer/filter/layer-filter.interface';
import { isOgcFilterDuringOptions, isOgcPushButton, searchFilter } from './filter/layer-filter.utils';

export class LayerEntity {
  options: LayerOptions & { id: number };

  get sourceOptions(): SourceOptions | undefined {
    return this.options?.sourceOptions;
  }

  constructor(layer: ILayer) {
    this.options = convertLayerToOptions(layer);
  }

  mergeLayerContext(layerContext: ILayerContext | undefined): void {
    const layerContextOptions = layerContext ? convertLayerContextToOptions(layerContext) : ({} as AnyLayerOptionsOut);

    if (
      !isLayerGroupOptions(layerContextOptions) &&
      this.sourceOptions?.ogcFilters &&
      layerContext?.sourceOptions?.ogcFilters && layerContextOptions.sourceOptions
    ) {
      layerContextOptions.sourceOptions.ogcFilters = this.mergeOgcFilter(
        this.sourceOptions.ogcFilters,
        layerContext.sourceOptions.ogcFilters
      );
    }

    this.options = ObjectUtils.mergeDeep(this.options, layerContextOptions) as AnyLayerOptionsOut;
  }

  private mergeOgcFilter(layerOgcFilters: OgcFiltersOptions, contextOgcFilters: OgcFiltersOptions): OgcFiltersOptions {
    const ogcFilters: OgcFiltersOptions = { ...layerOgcFilters };

    for (const selectorField of OgcSelectorFields) {
      const layerSelector = layerOgcFilters[selectorField];
      const contextSelector = contextOgcFilters[selectorField];
      if (layerSelector && contextSelector) {
        const groups = this.compareOgcSelectorFields(layerSelector, contextSelector);
        if (groups) {
          ogcFilters[selectorField] = {
            ...ogcFilters[selectorField],
            groups: groups
          };
        }
      }
    }

    if (contextOgcFilters.interfaceOgcFilters && layerOgcFilters.filters) {
      const mergedInterfaces = this.mergeOgcInterface(contextOgcFilters.interfaceOgcFilters, layerOgcFilters.filters);
      if (mergedInterfaces.length > 0) {
        ogcFilters.interfaceOgcFilters = mergedInterfaces;
      }
    }
    return ogcFilters;
  }

  private compareOgcSelectorFields(layerSelector: OgcSelector, contextSelector: OgcSelector): SelectorGroup[] {
    return contextSelector.groups.map((contextGroup) => this.mergeOgcSelectorField(layerSelector, contextGroup)).filter(Boolean) as SelectorGroup[];
  }

  private mergeOgcSelectorField(layerSelector: OgcSelector, contextGroup: SelectorGroup): SelectorGroup | undefined {
    const group = this.getLayerGroup(layerSelector, contextGroup);

    if (!group?.ids) {
      return undefined;
    }

    // Initial filter of contextBundles that match group ids
    let contextBundles = this.getContextSelectorBundlesByLayerIds(group.ids, contextGroup.computedSelectors ?? []);

    contextBundles = contextBundles
      .map((contextBundle) => this.mergeSelectorBundle(layerSelector, contextBundle))
      .filter(Boolean) as OgcSelectorBundle[];

    const otherLayerBundles = this.getLayerBundlesMissingInContextBundles(contextBundles, layerSelector.bundles ?? [], group);

    // Return merged group
    return {
      ...contextGroup,
      ...group,
      computedSelectors: [...contextBundles, ...otherLayerBundles]
    };
  }

  private getLayerGroup(layerSelector: OgcSelector, contextGroup: SelectorGroup): SelectorGroup | undefined {
    return layerSelector.groups.find((group) => group.name === contextGroup.name);
  }

  private getContextSelectorBundlesByLayerIds(
    ids: string[],
    contextSelectors: OgcSelectorBundle[]
  ): OgcSelectorBundle[] {
    return contextSelectors.filter((selector) => ids.includes(selector.id));
  }

  private mergeSelectorBundle(layerSelector: OgcSelector, contextBundle: OgcSelectorBundle): OgcSelectorBundle | undefined {
    const layerBundle: OgcSelectorBundle | undefined = layerSelector.bundles?.find((bundle) => bundle.id === contextBundle.id);
    if (!layerBundle) {
      return undefined;
    }
    // Map over selectors in the layerBundle
    const updatedSelectors = layerBundle.selectors?.map((layerSelectorBundle: OgcPushButton | Selector) => {
      const contextSelector = contextBundle.selectors?.find(
        (selector) => selector.title === layerSelectorBundle.title
      ) as Selector | OgcPushButton;

      return contextSelector ? this.mergeSelectorProperties(layerSelectorBundle, contextSelector) : layerSelectorBundle;
    });
    // return new Bundle with new Selectors
    return {
      ...contextBundle,
      ...layerBundle,
      selectors: updatedSelectors
    };
  }

  private mergeSelectorProperties(
    layerSelector: Selector | OgcPushButton,
    contextSelector: Selector | OgcPushButton
  ): Selector | OgcPushButton {
    const field: Selector | OgcPushButton = {
      ...layerSelector,
      ...contextSelector
    };

    if (isOgcPushButton(layerSelector) && isOgcPushButton(field) && layerSelector.color !== field.color) {
      field.color = layerSelector.color;
    }

    if (!isEqual(field.filters, layerSelector.filters)) {
      field.filters = layerSelector.filters;
    }

    return field;
  }

  private getLayerBundlesMissingInContextBundles(
    contextBundles: OgcSelectorBundle[],
    layerBundles: OgcSelectorBundle[],
    group: SelectorGroup
  ): OgcSelectorBundle[] {
    return layerBundles.filter(
      (layerBundle) =>
        !contextBundles.some((contextBundle) => contextBundle.id === layerBundle.id) &&
        group?.ids?.includes(layerBundle.id)
    );
  }

  private mergeOgcInterface(
    contextInterfaceOgcFilters: OgcInterfaceFilterOptions[],
    layerOgcFilters: LogicalArrayOptions | AnyBaseOgcFilterOptions
  ): OgcInterfaceFilterOptions[] {
    return contextInterfaceOgcFilters
      .filter((interfaceOgcFilter) => {
        const layerFilter = searchFilter(layerOgcFilters, interfaceOgcFilter.propertyName);

        if (!layerFilter) {
          return undefined;
        }

        if (isOgcFilterDuringOptions(layerFilter)) {
          if (!interfaceOgcFilter.hasOwnProperty('begin') && !isEmpty(layerFilter?.begin)) {
            interfaceOgcFilter.begin = layerFilter?.begin;
          }

          if (!interfaceOgcFilter.hasOwnProperty('end') && !isEmpty(layerFilter?.end)) {
            interfaceOgcFilter.end = layerFilter?.end;
          }
        }
        return interfaceOgcFilter;
      })
      .filter(Boolean);
  }
}

function isEmpty(value: string | undefined): boolean {
  return value === null || value === undefined || value === '';
}
