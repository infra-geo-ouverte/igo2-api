import { index, integer, json, serial } from 'drizzle-orm/pg-core';

import { appPgTable } from '../core/database';
import { metadataTimestampColumns } from '../core/database/model.utils';
import { IUserPreference } from './user.interface';

export const userModel = appPgTable(
  'user',
  {
    id: serial().primaryKey(),
    defaultContextId: integer(),
    preference: json().$type<IUserPreference>(),
    externalId: integer().notNull().unique(),
    ...metadataTimestampColumns
  },
  (table) => [index('idx_user_external_id').on(table.externalId)]
);
