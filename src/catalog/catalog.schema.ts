import { FastifySchema } from 'fastify';

import { Nullable } from '@igo2/fastify';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/typebox';
import Type, { TSchema } from 'typebox';

import { ICatalogOptions } from './catalog.interface';
import { catalogModel } from './catalog.model';

const ProfilOptionSchema = Type.Object<Record<keyof ICatalogOptions, TSchema>>(
  {
    regFilters: Type.Optional(Type.Array(Type.String())),
    sortDirection: Type.Optional(Type.String()),
    composite: Type.Optional(Type.Array(Type.Any()))
  },
  { additionalProperties: true }
);

const InsertCatalogSchema = createInsertSchema(catalogModel, {
  options: Type.Optional(ProfilOptionSchema)
});

const SelectCatalogSchema = createSelectSchema(catalogModel, {
  options: Nullable(ProfilOptionSchema)
});

export const GetByCatalogIdSchema = {
  description: 'Get catalog by id.',
  params: Type.Object({ id: Type.Number() }),
  response: {
    200: SelectCatalogSchema
  }
} satisfies FastifySchema;

export const GetCatalogsSchema = {
  description: 'Get all catalogs.',
  response: {
    200: Type.Array(SelectCatalogSchema)
  }
} satisfies FastifySchema;

export const DeleteByCatalogIdSchema = {
  description: 'Delete catalog by id.',
  params: Type.Object({ id: Type.Number() }),
  response: {
    204: Type.Number()
  }
} satisfies FastifySchema;

export const UpdateCatalogSchema = {
  description: 'Update catalog by id.',
  params: Type.Object({ id: Type.Number() }),
  body: InsertCatalogSchema,
  response: {
    200: SelectCatalogSchema
  }
} satisfies FastifySchema;

export const CreateCatalogSchema = {
  description: 'Create catalog.',
  body: InsertCatalogSchema,
  response: {
    201: SelectCatalogSchema
  }
} satisfies FastifySchema;
