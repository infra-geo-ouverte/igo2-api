import { integer, serial, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

import { appPgTable, metadataTimestampColumns } from '../../core/database';
import { contextModel } from '../context.model';

export const contextAccessModel = appPgTable(
  'context_access',
  {
    id: serial().primaryKey(),
    contextId: integer()
      .notNull()
      .references(() => contextModel.id, { onDelete: 'cascade' }),
    calls: integer().default(0),
    accessedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    ...metadataTimestampColumns
  },
  (table) => [uniqueIndex('uq_context_access_context').on(table.contextId)]
);
