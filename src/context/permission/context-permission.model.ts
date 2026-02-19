import { sql } from 'drizzle-orm';
import { check, integer, serial, uniqueIndex } from 'drizzle-orm/pg-core';

import {
  appPgEnum,
  appPgTable,
  metadataTimestampColumns
} from '../../core/database';
import { profilModel } from '../../profil/profil.model';
import { userModel } from '../../user/user.model';
import { contextModel } from '../context.model';
import { TypePermission } from './context-permission.interface';

export const contextTypePermissionEnum = appPgEnum(
  'enum_context_type_permission',
  TypePermission
);

export const contextPermissionModel = appPgTable(
  'context_permission',
  {
    id: serial().primaryKey(),
    typePermission: contextTypePermissionEnum().notNull(),
    profilId: integer().references(() => profilModel.id),
    userId: integer().references(() => userModel.id),
    contextId: integer()
      .notNull()
      .references(() => contextModel.id, { onDelete: 'cascade' }),
    ...metadataTimestampColumns
  },
  (table) => [
    check(
      'uq_context_permission_user_profil_one_not_null',
      sql`(${table.userId} IS NOT NULL AND ${table.profilId} IS NULL) OR (${table.userId} IS NULL AND ${table.profilId} IS NOT NULL)`
    ),
    uniqueIndex('uq_context_permission_user_context')
      .on(table.contextId, table.userId)
      .where(sql`${table.userId} IS NOT NULL`),
    uniqueIndex('uq_context_permission_profil_context')
      .on(table.contextId, table.profilId)
      .where(sql`${table.profilId} IS NOT NULL`)
  ]
);
