import { FastifySchema } from 'fastify';

import { Nullable } from '@igo2/fastify';
import { createInsertSchema, createSelectSchema } from 'drizzle-orm/typebox';
import Type, { TSchema } from 'typebox';

import { LayerOptionsSchema } from '../layer';
import { InsertToolSchema, SelectToolSchema } from '../tool';
import { IMap, IMapView } from './context.interface';
import { contextModel } from './context.model';

const MapOptionsSchema = Type.Object<Record<keyof IMap, TSchema>>({
  view: Type.Partial(
    Type.Object<Record<keyof IMapView, TSchema>>({
      center: Type.Tuple([Type.Number(), Type.Number()]),
      zoom: Type.Number(),
      projection: Type.String(),
      maxZoomOnExtent: Type.Optional(Type.Number())
    })
  )
});
const SelectContextSchema = Type.Interface(
  [
    createSelectSchema(contextModel, {
      map: Type.Optional(MapOptionsSchema)
    })
  ],
  {
    permission: Type.Optional(Type.String()),
    hidden: Type.Optional(Type.Boolean())
  }
);

const SelectContextDetailedSchema = Type.Interface([SelectContextSchema], {
  tools: Type.Array(Type.Omit(SelectToolSchema, ['profils'])),
  toolbar: Type.Array(Type.String()),
  layers: Type.Array(LayerOptionsSchema)
});

const InsertContextSchema = Type.Omit(
  createInsertSchema(contextModel, {
    map: Type.Optional(MapOptionsSchema)
  }),
  ['id', 'createdAt', 'updatedAt']
);

const InsertContextDetailedSchema = Type.Interface([InsertContextSchema], {
  tools: Type.Optional(Type.Array(InsertToolSchema)),
  layers: Type.Optional(Type.Array(LayerOptionsSchema))
});

export const BASE_SCHEMA_CONTEXT = {
  params: Type.Object({
    contextId: Type.Number()
  })
} satisfies FastifySchema;

export const GetContextDefaultSchema = {
  description: 'Get default context.',
  response: {
    200: SelectContextDetailedSchema,
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const PostContextDefaultSchema = {
  description: 'Define default context.',
  body: Type.Object({
    defaultContextId: Type.Number()
  }),
  response: {
    200: Type.Number(),
    400: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const GetContextDetailedByIdSchema = {
  ...BASE_SCHEMA_CONTEXT,
  description: 'Get details of context by context id.',
  response: {
    200: SelectContextDetailedSchema,
    401: { $ref: 'HttpError' },
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const GetContextByIdSchema = {
  ...BASE_SCHEMA_CONTEXT,
  description: 'Get context by id.',
  response: {
    200: SelectContextSchema,
    401: { $ref: 'HttpError' },
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const GetContextsSchema = {
  description: 'Get all contexts.',
  querystring: Type.Object({
    permission: Type.Optional(
      Type.Union([
        Type.String({ pattern: "^[\\wÀ-ÿ'\\-,]+$" }),
        Type.Array(Type.String())
      ])
    ),
    hidden: Type.Optional(Type.Boolean())
  }),
  response: {
    200: Type.Object({
      ours: Type.Array(SelectContextSchema),
      shared: Type.Array(SelectContextSchema),
      public: Type.Array(SelectContextSchema)
    }),
    401: { $ref: 'HttpError' },
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const DeleteContextSchema = {
  ...BASE_SCHEMA_CONTEXT,
  description: 'Delete context by id.',
  response: {
    204: Type.Number(),
    401: { $ref: 'HttpError' },
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const UpdateContextSchema = {
  ...BASE_SCHEMA_CONTEXT,
  description: 'Update context by id.',
  body: Type.Partial(InsertContextDetailedSchema),
  response: {
    200: Type.Any(), // @todo IContext,
    401: { $ref: 'HttpError' },
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const CreateContextSchema = {
  description: 'Create context.',
  body: InsertContextDetailedSchema,
  response: {
    201: SelectContextDetailedSchema,
    409: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const CloneContextSchema = {
  ...BASE_SCHEMA_CONTEXT,
  description: 'Clone context.',
  body: Nullable(Type.Partial(InsertContextDetailedSchema)),
  response: {
    201: SelectContextDetailedSchema,
    401: { $ref: 'HttpError' },
    403: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;
