import {
  boolean,
  index,
  integer,
  serial,
  uniqueIndex
} from 'drizzle-orm/pg-core';

import { appPgTable } from '../../core/database';
import { metadataTimestampColumns } from '../../core/database/model.utils';
import { baseToolModel, toolModel } from '../../tool';
import { contextModel } from '../context.model';

export const contextToolModel = appPgTable(
  'context_tool',
  {
    id: serial().primaryKey(),
    enabled: boolean(),
    contextId: integer()
      .notNull()
      .references(() => contextModel.id, { onDelete: 'cascade' }),
    toolId: integer()
      .notNull()
      .references(() => toolModel.id),
    ...baseToolModel,
    ...metadataTimestampColumns
  },
  (table) => [
    uniqueIndex('uq_context_tool_context_tool').on(
      table.contextId,
      table.toolId
    ),
    index('idx_context_tool_context_id').on(table.contextId),
    index('idx_context_tool_tool_id').on(table.toolId)
  ]
);
