import { FastifySchema } from 'fastify';

import { createSelectSchema } from 'drizzle-orm/typebox';
import Type from 'typebox';

import { contextHiddenModel } from './context-hidden.model';

const SelectContextHiddenSchema = createSelectSchema(contextHiddenModel);

const BASE_SCHEMA = {
  params: Type.Object({
    contextId: Type.Number()
  })
} satisfies FastifySchema;

export const GetContextAllHiddenSchema = {
  ...BASE_SCHEMA,
  description: 'Get all hidden contexts.',
  response: {
    200: Type.Array(SelectContextHiddenSchema),
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const GetContextHiddenSchema = {
  ...BASE_SCHEMA,
  description: 'Get hidden context by context id.',
  response: {
    200: SelectContextHiddenSchema,
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const GetContextShowSchema = {
  ...BASE_SCHEMA,
  description: 'Make context visible by context id.',
  response: {
    200: SelectContextHiddenSchema,
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const GetContextHideSchema = {
  ...BASE_SCHEMA,
  description: 'Hide context by context id.',
  response: {
    200: SelectContextHiddenSchema,
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;
