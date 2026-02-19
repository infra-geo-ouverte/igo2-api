import { FastifySchema } from 'fastify';

import { createInsertSchema, createSelectSchema } from 'drizzle-orm/typebox';
import Type from 'typebox';

import { LayerOptionsSchema, SourceOptionsSchema } from '../../layer';
import { contextLayerModel } from './context-layer.model';

const InsertContextLayerSchema = Type.Omit(
  createInsertSchema(contextLayerModel, {
    contextId: Type.Optional(Type.Number()), // Is coming from the url params
    layerOptions: Type.Optional(LayerOptionsSchema),
    sourceOptions: Type.Optional(SourceOptionsSchema)
  }),
  ['id', 'createdAt', 'updatedAt']
);

const SelectContextLayerSchema = createSelectSchema(contextLayerModel, {
  layerOptions: Type.Optional(LayerOptionsSchema),
  sourceOptions: Type.Optional(Type.Partial(SourceOptionsSchema))
});

const BASE_SCHEMA = {
  params: Type.Object({
    contextId: Type.Number()
  })
} satisfies FastifySchema;

export const GetContextLayersSchema = {
  ...BASE_SCHEMA,
  description: 'Get all layers by context id.',
  response: {
    200: Type.Array(SelectContextLayerSchema),
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const GetContextLayerSchema = {
  ...BASE_SCHEMA,
  description: 'Get layer context by id.',
  params: Type.Object({
    ...BASE_SCHEMA.params.properties,
    id: Type.Number()
  }),
  response: {
    200: SelectContextLayerSchema,
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const DeleteContextLayerSchema = {
  ...BASE_SCHEMA,
  description: 'Delete layer context by id.',
  params: Type.Object({
    ...BASE_SCHEMA.params.properties,
    id: Type.Number()
  }),
  response: {
    204: Type.Number(),
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const UpdateContextLayerSchema = {
  ...BASE_SCHEMA,
  description: 'Update layer context by id.',
  body: Type.Partial(InsertContextLayerSchema),
  params: Type.Object({
    ...BASE_SCHEMA.params.properties,
    id: Type.Number()
  }),
  response: {
    200: SelectContextLayerSchema,
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const CreateContextLayerSchema = {
  ...BASE_SCHEMA,
  description: 'Create layer context.',
  body: InsertContextLayerSchema,
  response: {
    201: SelectContextLayerSchema,
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;
