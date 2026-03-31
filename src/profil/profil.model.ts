import {
  boolean,
  integer,
  json,
  serial,
  text,
  varchar
} from 'drizzle-orm/pg-core';

import { appPgTable } from '../core/database';
import { IProfilPreference } from './profil.interface';

export const profilModel = appPgTable('profil', {
  id: serial().primaryKey(),
  name: varchar({ length: 128 }).notNull(),
  title: varchar({ length: 128 }).notNull(),
  group: varchar({ length: 128 }),
  preference: json().$type<IProfilPreference>(),
  canShare: boolean(),
  canShareToProfils: integer().array(),
  canFilter: boolean(),
  hasAcrigeo: boolean(),
  guides: text().array()
});
