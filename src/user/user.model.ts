import { index, integer, json, serial, text } from 'drizzle-orm/pg-core';

import { appPgEnum, appPgTable } from '../core/database';
import { metadataTimestampColumns } from '../core/database/model.utils';
import { IUserPreference, UserSource } from './user.interface';

export const userSourceEnum = appPgEnum('enum_user_source', UserSource);

export const userModel = appPgTable(
  'user',
  {
    id: serial().primaryKey(),
    source: userSourceEnum().notNull().default('user'),
    defaultContextId: integer(),
    preference: json().$type<IUserPreference>(),
    externalId: text().notNull().unique(),
    ...metadataTimestampColumns
  },
  (table) => [index('idx_user_external_id').on(table.externalId)]
);
