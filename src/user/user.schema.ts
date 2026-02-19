import { FastifySchema } from 'fastify';

import { createInsertSchema, createSelectSchema } from 'drizzle-orm/typebox';
import Type from 'typebox';

import { userModel } from './user.model';

const InsertUserSchema = Type.Omit(
  createInsertSchema(userModel, {
    preference: Type.Optional(Type.Record(Type.String(), Type.Unknown()))
  }),
  ['createdAt', 'updatedAt']
);

const SelectUserSchema = createSelectSchema(userModel, {
  preference: Type.Optional(Type.Record(Type.String(), Type.Unknown()))
});

export const GetUserSchema = {
  description: 'Get user.',
  response: {
    200: SelectUserSchema,
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const DeleteUserSchema = {
  description: 'Delete user.',
  response: {
    204: Type.Number(),
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const UpdateUserSchema = {
  description: 'Update user.',
  querystring: Type.Object({
    mergePreference: Type.Optional(Type.Boolean())
  }),
  body: Type.Partial(InsertUserSchema),
  response: {
    200: SelectUserSchema,
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const CreateUserSchema = {
  description: 'Create user.',
  body: InsertUserSchema,
  response: {
    201: SelectUserSchema,
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;
