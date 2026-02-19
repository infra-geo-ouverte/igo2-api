import { FastifySchema } from 'fastify';

import { createInsertSchema, createSelectSchema } from 'drizzle-orm/typebox';
import Type from 'typebox';

import { poiModel } from './poi.model';

const InsertPoiSchema = Type.Omit(
  createInsertSchema(poiModel, {
    userId: Type.Optional(Type.Number())
  }),
  ['id', 'createdAd', 'updatedAt']
);

const SelectPoiSchema = createSelectSchema(poiModel);

export const GetPoiSchema = {
  description: 'Get poi by id.',
  params: Type.Object({ id: Type.Number() }),
  response: {
    200: SelectPoiSchema,
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const GetAllPoiSchema = {
  description: 'Get all pois.',
  response: {
    200: Type.Array(SelectPoiSchema)
  }
} satisfies FastifySchema;

export const DeletePoiSchema = {
  description: 'Delete poi by id.',
  params: Type.Object({ id: Type.Number() }),
  response: {
    204: Type.Number(),
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const UpdatePoiSchema = {
  description: 'Update poi by id.',
  params: Type.Object({ id: Type.Number() }),
  body: Type.Partial(InsertPoiSchema),
  response: {
    200: SelectPoiSchema,
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const CreatePoiSchema = {
  description: 'Create poi.',
  body: InsertPoiSchema,
  response: {
    201: SelectPoiSchema,
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;
