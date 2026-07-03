export interface OgcFiltersOptions {
  enabled?: boolean;
  editable?: boolean;
  pushButtons?: OgcSelector;
  checkboxes?: OgcSelector;
  radioButtons?: OgcSelector;
  select?: OgcSelector;
  autocomplete?: OgcSelector;
  filters?: LogicalArrayOptions | AnyBaseOgcFilterOptions;
  interfaceOgcFilters?: OgcInterfaceFilterOptions[];
  [key: string]: unknown;
}

export interface OgcSelector {
  groups: SelectorGroup[];
  bundles?: OgcSelectorBundle[];
  [key: string]: unknown;
}

export interface SelectorGroup {
  enabled?: boolean;
  title?: string;
  name: string;
  ids?: string[];
  computedSelectors?: OgcSelectorBundle[];
}

export interface OgcSelectorBundle {
  id: string;
  title?: string;
  selectors?:
    | OgcPushButton[]
    | OgcCheckbox[]
    | OgcRadioButton[]
    | OgcSelect[]
    | OgcAutocomplete[];
  domSelectors?: DomSelector[];
  [key: string]: unknown;
}

export interface Selector {
  title: string;
  tooltip?: string;
  enabled?: boolean;
  filters?: Record<string, unknown>;
}

export type OgcPushButton = Selector & { color?: string };
export type OgcCheckbox = Selector;
export type OgcRadioButton = Selector;
export type OgcSelect = Selector;
export type OgcAutocomplete = Selector;

export const OgcSelectorFields = [
  'pushButtons',
  'checkboxes',
  'radioButtons',
  'select',
  'autocomplete'
] as const;

export interface OgcInterfaceFilterOptions {
  active?: boolean;
  begin?: string;
  end?: string;
  propertyName?: string;
  operator?: string;
  [key: string]: unknown;
}

export type AnyBaseOgcFilterOptions =
  | OgcFilterConditionsArrayOptions
  | OgcFilterSpatialOptions
  | OgcFilterDuringOptions
  | OgcFilterIsBetweenOptions
  | OgcFilterEqualToOptions
  | OgcFilterGreaterLessOptions
  | OgcFilterIsLikeOptions
  | OgcFilterAttributeOptions;

export interface LogicalArrayOptions {
  logical: string;
  filters: LogicalArrayOptions | AnyBaseOgcFilterOptions[];
}

interface OgcFilterAttributeOptions {
  propertyName: string;
  operator: string;
  active?: boolean;
  id?: string;
}

export interface OgcFilterDuringOptions extends OgcFilterAttributeOptions {
  begin: string;
  end?: string;
  step: string;
  title?: string;
  [key: string]: unknown;
}

interface OgcFilterIsBetweenOptions extends OgcFilterAttributeOptions {
  lowerBoundary: number;
  upperBoundary: number;
}

interface OgcFilterEqualToOptions extends OgcFilterAttributeOptions {
  expression: string | number;
  matchCase?: boolean;
}

interface OgcFilterGreaterLessOptions extends OgcFilterAttributeOptions {
  expression: number;
}
interface OgcFilterIsLikeOptions extends OgcFilterAttributeOptions {
  pattern: string;
  wildCard?: string;
  singleChar?: string;
  escapeChar?: string;
  matchCase: boolean;
}

export type OgcFilterConditionsArrayOptions = Record<
  string,
  Record<string, unknown>
>;

export interface OgcFilterSpatialOptions {
  geometryName: string;
  wkt_geometry?: string;
  extent?: [number, number, number, number];
  srsName?: string;
  active: boolean;
  id: string;
  [key: string]: unknown;
}

export interface DomSelector {
  id: number;
  name: string;
  operator: string;
  propertyName: string;
  domValue?: DOMValue[];
}

export interface DOMValue {
  id: number | string;
  value: string;
}
