import { index } from 'drizzle-orm/cockroach-core';
import { integer, json, serial, varchar } from 'drizzle-orm/pg-core';

import { appPgEnum, appPgTable } from '../core/database';
import { metadataTimestampColumns } from '../core/database/model.utils';
import { userModel } from '../user/user.model';
import { IMap, Scope } from './context.interface';

export const contextScopeEnum = appPgEnum('enum_context_scope', Scope);

export const contextModel = appPgTable(
  'context',
  {
    id: serial().primaryKey(),
    uri: varchar({ length: 64 }).notNull().unique(),
    title: varchar({ length: 128 }).notNull(),
    icon: varchar({ length: 128 }),
    scope: contextScopeEnum().notNull(),
    map: json().$type<IMap>(),
    userId: integer().references(() => userModel.id),
    ...metadataTimestampColumns
  },
  (table) => [
    index('idx_context_user_id').on(table.userId),
    index('idx_context_scope').on(table.scope)
  ]
);
