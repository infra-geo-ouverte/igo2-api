import { index, integer, serial, uniqueIndex } from 'drizzle-orm/pg-core';

import { appPgTable, metadataTimestampColumns } from '../../core/database';
import { userModel } from '../../user/user.model';
import { contextModel } from '../context.model';

export const contextHiddenModel = appPgTable(
  'context_hidden',
  {
    id: serial().primaryKey(),
    userId: integer().references(() => userModel.id),
    contextId: integer()
      .notNull()
      .references(() => contextModel.id, { onDelete: 'cascade' }),
    ...metadataTimestampColumns
  },
  (table) => [
    uniqueIndex('uq_context_hidden_context_user').on(
      table.contextId,
      table.userId
    ),
    index('idx_context_hidden_context_id').on(table.contextId)
  ]
);
