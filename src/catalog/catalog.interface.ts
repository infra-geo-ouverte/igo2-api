import { catalogModel } from './catalog.model';

export interface ICatalogOptions {
  regFilters?: string[];
  sortDirection?: string;
  composite?: Record<string, unknown[]>;
  [key: string]: unknown;
}

export type ICatalog = typeof catalogModel.$inferSelect;

export type ICatalogIn = Omit<
  typeof catalogModel.$inferInsert,
  'createdAt' | 'updatedAt'
>;
