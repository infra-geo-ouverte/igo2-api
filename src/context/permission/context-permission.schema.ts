import { FastifySchema } from 'fastify';

import { createInsertSchema, createSelectSchema } from 'drizzle-orm/typebox';
import Type, { Static, TSchema } from 'typebox';

import { ProfilType } from '../../profil';
import { BASE_SCHEMA_CONTEXT } from '../context.schema';
import { contextPermissionModel } from './context-permission.model';

const SelectContextPermissionSchema = Type.Interface(
  [createSelectSchema(contextPermissionModel)],
  {
    title: Type.String(),
    profilType: Type.Enum(ProfilType)
  }
);

const InsertContextPermissionSchema = Type.Interface(
  [Type.Omit(createInsertSchema(contextPermissionModel), ['contextId'])],
  {
    contextId: Type.Optional(Type.Number())
  }
);

export const GetAllContextPermissionSchema = {
  ...BASE_SCHEMA_CONTEXT,
  description: 'Get permissions by context id.',
  response: {
    200: Type.Array(SelectContextPermissionSchema),
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const DeleteContextPermissionSchema = {
  ...BASE_SCHEMA_CONTEXT,
  description: 'Delete context permission by id.',
  params: Type.Object({
    id: Type.Number(),
    ...BASE_SCHEMA_CONTEXT.params.properties
  }),
  response: {
    204: Type.Number(),
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const GetContextPermissionByIdSchema = {
  ...BASE_SCHEMA_CONTEXT,
  description: 'Get context permission by id.',
  params: Type.Object({
    id: Type.Number(),
    ...BASE_SCHEMA_CONTEXT.params.properties
  }),
  response: {
    200: SelectContextPermissionSchema,
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const UpdateContextPermissionSchema = {
  ...BASE_SCHEMA_CONTEXT,
  description: 'Update context permission by id.',
  params: Type.Object({
    id: Type.Number(),
    ...BASE_SCHEMA_CONTEXT.params.properties
  }),
  body: Type.Partial(InsertContextPermissionSchema),
  response: {
    200: SelectContextPermissionSchema,
    404: { $ref: 'HttpError' }
  }
} satisfies FastifySchema;

export const Nullable = <T extends TSchema>(schema: T) =>
  Type.Unsafe<Static<T> | null>({
    ...schema,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type: [(schema as any).type, 'null'] // Combines types into an array: ['number', 'null']
  });

export const CreateContextPermissionSchema = {
  ...BASE_SCHEMA_CONTEXT,
  description: 'Create context permission.',
  body: Type.Interface(
    [Type.Omit(InsertContextPermissionSchema, ['profilId', 'userId'])],
    {
      userExternalId: Type.Number(),
      userId: Type.Optional(Nullable(Type.Number())),
      profilId: Type.Optional(Nullable(Type.Number()))
    }
  ),
  response: {
    201: SelectContextPermissionSchema
  }
} satisfies FastifySchema;
