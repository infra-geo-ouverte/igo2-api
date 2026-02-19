import { FastifySchema } from 'fastify';

import { createInsertSchema, createSelectSchema } from 'drizzle-orm/typebox';
import Type from 'typebox';

import { LayerType } from './layer.interface';
import { layerModel } from './layer.model';

export const LayerOptionsSchema = Type.Object(
  {
    title: Type.Optional(Type.String()),
    baseLayer: Type.Optional(Type.Boolean()),
    opacity: Type.Optional(Type.Number()),
    visible: Type.Optional(Type.Boolean()),
    extent: Type.Optional(
      Type.Tuple([Type.Number(), Type.Number(), Type.Number(), Type.Number()])
    ),
    zIndex: Type.Optional(Type.Number()),
    minResolution: Type.Optional(Type.Number()),
    maxResolution: Type.Optional(Type.Number())
  },
  { additionalProperties: true }
);

export const SourceOptionsSchema = Type.Object(
  {
    type: Type.Enum(LayerType),
    url: Type.String(),
    params: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
    version: Type.Optional(Type.String())
  },
  { additionalProperties: true }
);

export const InsertLayerSchema = Type.Omit(
  createInsertSchema(layerModel, {
    layerOptions: Type.Optional(LayerOptionsSchema),
    sourceOptions: Type.Optional(SourceOptionsSchema)
  }),
  ['id', 'createdAt', 'updatedAt']
);

const SelectLayerSchema = createSelectSchema(layerModel, {
  layerOptions: Type.Optional(LayerOptionsSchema),
  sourceOptions: Type.Optional(SourceOptionsSchema)
});

export const GetLayerOptionSchema = {
  description: 'Get layer options by source.',
  querystring: Type.Object({
    type: Type.Enum(LayerType),
    url: Type.String(),
    layers: Type.Optional(Type.String()),
    key: Type.Optional(Type.String())
  }),
  response: {
    200: LayerOptionsSchema,
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const GetLayerAdminOptionSchema = {
  description: 'Get layer admin options by source.',
  querystring: Type.Object({
    type: Type.Enum(LayerType),
    url: Type.String(),
    layers: Type.Optional(Type.String())
  }),
  response: {
    200: LayerOptionsSchema,
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const GetLayerSchema = {
  description: 'Get layer by id.',
  params: Type.Object({
    id: Type.Number()
  }),
  response: {
    200: SelectLayerSchema,
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const GetLayersSchema = {
  description: 'Get all layers.',
  response: {
    200: Type.Array(SelectLayerSchema)
  }
} satisfies FastifySchema;

export const GetBaseLayersSchema = {
  description: 'Get base layers.',
  response: {
    200: Type.Array(SelectLayerSchema)
  }
} satisfies FastifySchema;

export const DeleteLayerSchema = {
  description: 'Delete layer by id.',
  params: Type.Object({
    id: Type.Number()
  }),
  response: {
    204: Type.Number(),
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const UpdateLayerSchema = {
  description: 'Update layer by id.',
  params: Type.Object({
    id: Type.Number()
  }),
  body: Type.Partial(InsertLayerSchema),
  response: {
    200: SelectLayerSchema,
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const CreateLayerSchema = {
  description: 'Create layer.',
  body: InsertLayerSchema,
  response: {
    201: SelectLayerSchema
  }
} satisfies FastifySchema;
