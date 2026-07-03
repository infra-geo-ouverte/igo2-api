import { defineRelationsPart } from 'drizzle-orm';

import { contextLayerModel } from '.';
import { layerModel } from '../../layer/layer.model';
import { contextModel } from '../context.model';

export const contextLayerRelations = defineRelationsPart(
  { contextLayer: contextLayerModel, context: contextModel, layer: layerModel },
  (r) => ({
    contextLayer: {
      context: r.one.context({
        from: r.contextLayer.contextId,
        to: r.context.id
      }),
      layer: r.one.layer({
        from: r.contextLayer.layerId,
        to: r.layer.id,
        optional: true
      })
    }
  })
);
