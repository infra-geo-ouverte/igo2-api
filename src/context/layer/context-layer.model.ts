import { index, integer, json, serial, uniqueIndex } from 'drizzle-orm/pg-core';

import { appPgTable, metadataTimestampColumns } from '../../core/database';
import { layerModel } from '../../layer/layer.model';
import { contextModel } from '../context.model';
import {
  IAnyContextLayerOptions,
  IContextLayerSourceOptions
} from './context-layer.interface';

export const contextLayerModel = appPgTable(
  'context_layer',
  {
    id: serial().primaryKey(),
    layerOptions: json().$type<IAnyContextLayerOptions>(),
    sourceOptions: json().$type<IContextLayerSourceOptions>(),
    contextId: integer()
      .notNull()
      .references(() => contextModel.id, { onDelete: 'cascade' }),
    /** We consider as a system layer if it is not linked to a layer like LayerGroup */
    layerId: integer().references(() => layerModel.id, { onDelete: 'cascade' }),
    ...metadataTimestampColumns
  },
  (table) => [
    uniqueIndex('uq_context_layer_context_layer').on(
      table.contextId,
      table.layerId
    ),
    index('idx_context_layer_context_id').on(table.contextId),
    index('idx_context_layer_layer_id').on(table.layerId)
  ]
);
