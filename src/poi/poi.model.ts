import {
  doublePrecision,
  index,
  integer,
  serial,
  varchar
} from 'drizzle-orm/pg-core';

import { appPgTable } from '../core/database';
import { metadataTimestampColumns } from '../core/database/model.utils';
import { userModel } from '../user';

export const poiModel = appPgTable(
  'poi',
  {
    id: serial().primaryKey(),
    title: varchar({ length: 64 }).notNull(),
    x: doublePrecision().notNull(),
    y: doublePrecision().notNull(),
    zoom: integer().notNull(),
    userId: integer()
      .notNull()
      .references(() => userModel.id),
    ...metadataTimestampColumns
  },
  (table) => [index('idx_poi_user_id').on(table.userId)]
);
