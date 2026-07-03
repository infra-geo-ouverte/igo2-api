import {
  AnyBaseOgcFilterOptions,
  LogicalArrayOptions,
  OgcFilterConditionsArrayOptions,
  OgcFilterDuringOptions,
  OgcFilterSpatialOptions,
  OgcPushButton,
  Selector
} from './layer-filter.interface';

export function isOgcPushButton(
  selector: Selector | OgcPushButton
): selector is OgcPushButton {
  return 'color' in selector;
}

export function isOgcFilterDuringOptions(
  filters: LogicalArrayOptions | AnyBaseOgcFilterOptions
): filters is OgcFilterDuringOptions {
  return 'begin' in filters && 'end' in filters;
}

export function isLogicalArray(
  filters: LogicalArrayOptions | AnyBaseOgcFilterOptions
): filters is LogicalArrayOptions {
  return 'filters' in filters && 'logical' in filters;
}

export function isFilterAttributeOptions(
  filters: AnyBaseOgcFilterOptions
): filters is Exclude<
  AnyBaseOgcFilterOptions,
  OgcFilterConditionsArrayOptions | OgcFilterSpatialOptions
> {
  return 'propertyName' in filters;
}

/** Recursive */
export function searchFilter(
  filters: LogicalArrayOptions | AnyBaseOgcFilterOptions,
  propertyName: string | undefined
): LogicalArrayOptions | AnyBaseOgcFilterOptions | undefined {
  if (isLogicalArray(filters)) {
    if (Array.isArray(filters.filters)) {
      return filters.filters.find((filter) =>
        searchFilter(filter, propertyName)
      );
    } else {
      searchFilter(filters, propertyName);
    }
  } else if (isFilterAttributeOptions(filters)) {
    if (filters.propertyName === propertyName) {
      return filters;
    }
  }
  return undefined;
}
