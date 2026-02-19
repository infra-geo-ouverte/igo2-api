import { FastifySchema } from 'fastify';

import { createInsertSchema, createSelectSchema } from 'drizzle-orm/typebox';
import Type from 'typebox';

import { contextToolModel } from './context-tool.model';

const InsertContextToolSchema = createInsertSchema(contextToolModel, {
  contextId: Type.Optional(Type.Number()), // Is coming from the url params
  options: Type.Optional(Type.Record(Type.String(), Type.Unknown()))
});

const SelectContextToolSchema = createSelectSchema(contextToolModel);

const BASE_SCHEMA = {
  params: Type.Object({
    contextId: Type.Number()
  })
} satisfies FastifySchema;

export const GetContextToolsSchema = {
  ...BASE_SCHEMA,
  description: 'Get tools by context id.',
  response: {
    200: Type.Array(SelectContextToolSchema),
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const GetContextToolSchema = {
  ...BASE_SCHEMA,
  description: 'Get tool context by id.',
  params: Type.Object({
    ...BASE_SCHEMA.params.properties,
    toolId: Type.Number()
  }),
  response: {
    200: SelectContextToolSchema,
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const DeleteContextToolSchema = {
  ...BASE_SCHEMA,
  description: 'Delete tool context by id.',
  params: Type.Object({
    ...BASE_SCHEMA.params.properties,
    toolId: Type.Number()
  }),
  response: {
    204: Type.Number(),
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const UpdateContextToolSchema = {
  ...BASE_SCHEMA,
  description: 'Update tool context by id.',
  params: Type.Object({
    ...BASE_SCHEMA.params.properties,
    toolId: Type.Number()
  }),
  body: Type.Partial(InsertContextToolSchema),
  response: {
    200: SelectContextToolSchema,
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const CreateContextToolSchema = {
  ...BASE_SCHEMA,
  description: 'Create tool context.',
  body: InsertContextToolSchema,
  response: {
    201: SelectContextToolSchema,
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;
