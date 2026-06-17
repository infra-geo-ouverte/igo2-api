import { FastifySchema } from 'fastify';

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema
} from 'drizzle-orm/typebox';
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

export const LayerSourceOptionsSchema = Type.Omit(
  SourceOptionsSchema,
  ['type', 'url'],
  { additionalProperties: true }
);

export const InsertLayerSchema = Type.Omit(
  createInsertSchema(layerModel, {
    layerOptions: Type.Optional(LayerOptionsSchema),
    sourceOptions: Type.Optional(SourceOptionsSchema)
  }),
  ['id', 'createdAt', 'updatedAt']
);

export const PatchLayerSchema = Type.Omit(
  createUpdateSchema(layerModel, {
    layerOptions: Type.Optional(LayerOptionsSchema),
    sourceOptions: Type.Optional(LayerSourceOptionsSchema)
  }),
  ['id', 'createdAt', 'updatedAt']
);

const SelectLayerSchema = createSelectSchema(layerModel, {
  layerOptions: Type.Optional(LayerOptionsSchema),
  sourceOptions: Type.Optional(LayerSourceOptionsSchema)
});

const LayerKeyIdentifier = Type.Object({
  type: Type.Enum(LayerType),
  url: Type.String(),
  layers: Type.Optional(Type.String())
});

const SearchLayerItemSchema = Type.Object({
  score: Type.Number(),
  properties: Type.Object(
    {
      name: Type.Optional(Type.String()),
      title: Type.Optional(Type.String()),
      abstract: Type.Optional(Type.String()),
      keywords: Type.Optional(Type.Array(Type.String())),
      metadataUrl: Type.Optional(Type.String()),
      minScaleDenom: Type.Optional(Type.Number()),
      maxScaleDenom: Type.Optional(Type.Number()),
      queryable: Type.Optional(Type.Boolean()),
      optionsFromCapabilities: Type.Optional(Type.Boolean()),
      type: Type.Union([Type.Literal('layer'), Type.Literal('group')]),
      format: Type.Enum(LayerType),
      url: Type.String(),
      sourceId: Type.Number(),
      id: Type.String()
    },
    { additionalProperties: false }
  ),
  highlight: Type.Object(
    {
      title: Type.Optional(Type.String())
    },
    { additionalProperties: false }
  )
});

const SearchLayerResultSchema = Type.Object({
  items: Type.Array(SearchLayerItemSchema),
  maxScore: Type.Optional(Type.Number())
});

export const SearchLayerOptionSchema = {
  description: 'Search layers.',
  querystring: Type.Object({
    q: Type.String(),
    type: Type.Optional(
      Type.Union([Type.Literal('layer'), Type.Literal('group')])
    ),
    limit: Type.Optional(Type.Integer({ minimum: 1 })),
    page: Type.Optional(Type.Integer({ minimum: 1 }))
  }),
  response: {
    200: SearchLayerResultSchema
  }
} satisfies FastifySchema;

export const GetLayerOptionSchema = {
  description: 'Get layer options by source.',
  querystring: Type.Interface([LayerKeyIdentifier], {
    key: Type.Optional(Type.String())
  }),
  response: {
    200: LayerOptionsSchema,
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const GetLayerAdminOptionSchema = {
  description: 'Get layer admin options by source.',
  querystring: LayerKeyIdentifier,
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
  body: PatchLayerSchema,
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

const MigrateInsertSchema = Type.Intersect([
  Type.Omit(InsertLayerSchema, ['layerOptions', 'sourceOptions']),
  Type.Object({
    layerOptions: Type.Union([LayerOptionsSchema, Type.Null()]),
    sourceOptions: Type.Union([SourceOptionsSchema, Type.Null()])
  })
]);

export const LayerMigrateBatchSchema = {
  description: 'Migrate layers in batch.',
  body: Type.Object({
    toAdd: Type.Optional(Type.Array(MigrateInsertSchema)),
    toPut: Type.Optional(
      Type.Array(
        Type.Intersect([
          Type.Object({
            id: Type.Number()
          }),
          Type.Object({
            layerOptions: Type.Optional(
              Type.Union([LayerOptionsSchema, Type.Null()])
            ),
            sourceOptions: Type.Optional(
              Type.Union([SourceOptionsSchema, Type.Null()])
            )
          })
        ])
      )
    )
  }),
  response: {
    200: Type.Object({})
  }
} satisfies FastifySchema;

export const LayerMigrateSchema = {
  description: 'Migrate a specific layer.',
  body: MigrateInsertSchema,
  response: {
    200: SelectLayerSchema
  }
} satisfies FastifySchema;
