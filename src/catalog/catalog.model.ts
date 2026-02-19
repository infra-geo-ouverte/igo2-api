import { integer, json, serial, text, varchar } from 'drizzle-orm/pg-core';

import { appPgTable } from '../core/database';
import { metadataTimestampColumns } from '../core/database/model.utils';
import { ICatalogOptions } from './catalog.interface';

export const catalogModel = appPgTable('catalog', {
  id: serial().primaryKey(),
  title: varchar({ length: 64 }).notNull(),
  url: varchar({ length: 128 }),
  options: json().$type<ICatalogOptions>(),
  order: integer(),
  profils: text().array(),
  ...metadataTimestampColumns
});
