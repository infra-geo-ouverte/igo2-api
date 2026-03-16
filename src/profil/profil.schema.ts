import { FastifySchema } from 'fastify';

import { createInsertSchema, createSelectSchema } from 'drizzle-orm/typebox';
import Type, { TSchema } from 'typebox';

import { ISearchResult } from './profil.interface';
import { profilModel } from './profil.model';

const InsertProfilSchema = createInsertSchema(profilModel, {
  preference: Type.Optional(Type.Record(Type.String(), Type.Unknown()))
});

const SelectProfilSchema = createSelectSchema(profilModel, {
  preference: Type.Optional(Type.Record(Type.String(), Type.Unknown()))
});

const SearchResultSchema = Type.Object<Record<keyof ISearchResult, TSchema>>({
  id: Type.Number(),
  name: Type.String(),
  title: Type.String(),
  type: Type.Union([Type.Literal('user'), Type.Literal('profil')])
});

export const GetUsersAndProfilsSchema = {
  description: 'Get profile and user by query.',
  querystring: Type.Object({
    q: Type.Optional(Type.String({ pattern: "^[\\wÀ-ÿ'\\-, ]+$" })),
    limit: Type.Optional(Type.Number({ maximum: 20 }))
  }),
  response: {
    200: Type.Array(SearchResultSchema)
  }
} satisfies FastifySchema;

export const GetAllProfilSchema = {
  description: 'Get all profiles.',
  response: {
    200: Type.Array(
      Type.Intersect([
        Type.Pick(SelectProfilSchema, ['name', 'title']),
        Type.Object({
          childs: Type.Optional(
            Type.Array(Type.Pick(SelectProfilSchema, ['name', 'title']))
          )
        })
      ])
    )
  }
} satisfies FastifySchema;

export const GetProfilSchema = {
  description: 'Get profile by name.',
  params: Type.Object({ name: Type.String() }),
  response: {
    200: SelectProfilSchema,
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const DeleteProfilSchema = {
  description: 'Delete profile by name.',
  params: Type.Object({ name: Type.String() }),
  response: {
    204: Type.Number(),
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const UpdateProfilSchema = {
  description: 'Update profile by name.',
  params: Type.Object({ name: Type.String() }),
  body: InsertProfilSchema,
  response: {
    200: SelectProfilSchema,
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const CreateProfilSchema = {
  description: 'Create profile.',
  body: InsertProfilSchema,
  response: {
    201: SelectProfilSchema
  }
} satisfies FastifySchema;
