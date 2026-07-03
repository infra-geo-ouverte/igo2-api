import { FastifySchema } from 'fastify';

import { createInsertSchema, createSelectSchema } from 'drizzle-orm/typebox';
import Type from 'typebox';

import { toolModel } from './tool.model';

export const InsertToolSchema = Type.Omit(
  createInsertSchema(toolModel, {
    options: Type.Optional(Type.Record(Type.String(), Type.Unknown()))
  }),
  ['id', 'createdAt', 'updatedAt']
);

const BaseSelectToolSchema = createSelectSchema(toolModel, {
  options: Type.Optional(Type.Record(Type.String(), Type.Unknown()))
});

export const SelectToolSchema = BaseSelectToolSchema;

export const GetToolSchema = {
  description: 'Get tool by id.',
  params: Type.Object({ id: Type.Number() }),
  response: {
    200: SelectToolSchema,
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const GetAllToolSchema = {
  description: 'Get all tools.',
  response: {
    200: Type.Array(SelectToolSchema)
  }
} satisfies FastifySchema;

export const DeleteToolSchema = {
  description: 'Delete tool by id.',
  params: Type.Object({ id: Type.Number() }),
  response: {
    204: Type.Number(),
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const UpdateToolSchema = {
  description: 'Update tool by id.',
  params: Type.Object({ id: Type.Number() }),
  body: Type.Partial(InsertToolSchema),
  response: {
    200: SelectToolSchema,
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const CreateToolSchema = {
  description: 'Create tool.',
  body: InsertToolSchema,
  response: {
    201: SelectToolSchema,
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;
