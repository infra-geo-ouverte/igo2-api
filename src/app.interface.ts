import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { FastifySchema } from 'fastify/types/schema';

import {
  DATABASE_ADMIN_ENV_SCHEMA,
  DATABASE_BASE_ENV_SCHEMA,
  DATABASE_LOCAL_ENV_SCHEMA,
  DATABASE_RW_ENV_SCHEMA,
  IConfig,
  IDatabaseEnv,
  ILoggerEnv,
  ISentryEnv,
  InstanceSchema,
  LOGGER_ENV_SCHEMA,
  ReplySchema,
  RequestSchema,
  SENTRY_ENV_SCHEMA,
  StringArray
} from '@igo2/fastify';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import Type, { TSchema } from 'typebox';

import { IAuthEnv } from './auth';
import relations from './core/database/relations';

export const Language = ['fr', 'en'] as const;
export type Language = (typeof Language)[number];

export const defaultLanguage: Language = 'fr';

export type AppInstance = FastifyInstance & InstanceSchema;

export type AppDatabase = NodePgDatabase<typeof relations>;

export type AppRequest<TSchema extends FastifySchema = FastifySchema> =
  FastifyRequest & RequestSchema<TSchema>;

export type AppReply<TSchema extends FastifySchema = FastifySchema> =
  FastifyReply & ReplySchema<TSchema>;

export type IAppEnv = IConfig &
  IAppBaseEnv &
  ISentryEnv &
  IDatabaseEnv &
  ILoggerEnv;

interface IAppBaseEnv extends IAuthEnv {
  KONG_API: string;
  ADMIN_KEY: string;
  /** Web Service Security */
  WSS_API?: string;
  OGC_WSS_HOSTS: string[];
  OGC_WSS_URI: string;
  OGC_WSS_BASE_PATHS: string[];
}

export const APP_BASE_ENV_SCHEMA = Type.Object<
  Record<keyof IAppBaseEnv, TSchema>
>({
  AUTH_API: Type.String(),
  KONG_API: Type.String(),
  ADMIN_KEY: Type.String(),
  WSS_API: Type.String(),
  OGC_WSS_HOSTS: StringArray(),
  OGC_WSS_URI: Type.String({ default: '/apis/wss/' }),
  OGC_WSS_BASE_PATHS: Type.Array(Type.String(), { default: ['/apis/'] })
});

const DatabaseEnvSchema = Type.Evaluate(
  Type.Intersect(
    [
      DATABASE_BASE_ENV_SCHEMA,
      process.env.ENVIRONMENT === 'local'
        ? DATABASE_LOCAL_ENV_SCHEMA
        : Type.Evaluate(
            Type.Intersect([DATABASE_RW_ENV_SCHEMA, DATABASE_ADMIN_ENV_SCHEMA])
          )
    ].filter(Boolean)
  )
);

export const APP_ENV_SCHEMA = Type.Evaluate(
  Type.Intersect([
    APP_BASE_ENV_SCHEMA,
    SENTRY_ENV_SCHEMA,
    DatabaseEnvSchema,
    LOGGER_ENV_SCHEMA
  ])
);
