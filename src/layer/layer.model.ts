import { index, uniqueIndex } from 'drizzle-orm/cockroach-core';
import { boolean, json, serial, varchar } from 'drizzle-orm/pg-core';

import { appPgEnum, appPgTable } from '../core/database';
import { metadataTimestampColumns } from '../core/database/model.utils';
import {
  AnyLayerOptionsWithoutSource,
  LayerType,
  SourceOptions
} from './layer.interface';

export const layerTypeEnum = appPgEnum('enum_layer_type', LayerType);

export const layerModel = appPgTable(
  'layer',
  {
    id: serial().primaryKey(),
    type: layerTypeEnum().notNull(),
    url: varchar().notNull(),
    layers: varchar({ length: 128 }),
    global: boolean(),
    layerOptions: json().$type<AnyLayerOptionsWithoutSource>(),
    sourceOptions: json().$type<SourceOptions>(),
    ...metadataTimestampColumns
  },
  (table) => [
    uniqueIndex('uq_layer_type_url_layers').on(
      table.type,
      table.url,
      table.layers
    ),
    index('idx_layer_global').on(table.global)
  ]
);
