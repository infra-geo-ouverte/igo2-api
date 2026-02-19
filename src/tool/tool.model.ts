import {
  boolean,
  integer,
  json,
  serial,
  text,
  varchar
} from 'drizzle-orm/pg-core';

import { appPgTable } from '../core/database';
import { metadataTimestampColumns } from '../core/database/model.utils';
import { IToolOptions } from './tool.interface';

export const baseToolModel = {
  order: integer('order'),
  options: json('options').$type<IToolOptions>()
};

export const toolModel = appPgTable('tool', {
  id: serial().primaryKey(),
  name: varchar({ length: 64 }).unique().notNull(),
  title: varchar({ length: 64 }),
  tooltip: varchar({ length: 128 }),
  icon: varchar({ length: 128 }),
  inToolbar: boolean(),
  global: boolean(),
  profils: text().array(),
  ...baseToolModel,
  ...metadataTimestampColumns
});
