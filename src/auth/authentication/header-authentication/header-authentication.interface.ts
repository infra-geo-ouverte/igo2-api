import { FastifySchema } from 'fastify';

import { StringArray } from '@igo2/fastify';
import { IncomingHttpHeaders } from 'http';
import { TSchema, Type } from 'typebox';

import { Nullable } from '../../../core/schema/schema';
import { ConsumerGroups } from '../shared/consumer';

export const HeaderAnonymousConsumer = 'x-anonymous-consumer' as const;

export const HeaderApiKey = 'x-api-key' as const;

export const HeaderConsumers = [
  'x-consumer-id',
  'x-consumer-custom-id',
  'x-consumer-username',
  'x-consumer-groups',
  HeaderAnonymousConsumer,
  HeaderApiKey
] as const;
export type HeaderConsumer = (typeof HeaderConsumers)[number];

const HEADERS_CONSUMER_SCHEMA_NAME = 'ConsumerHeadersSchema';
export const HEADERS_CONSUMER_SCHEMA_REF = Type.Ref(
  HEADERS_CONSUMER_SCHEMA_NAME
);

export const HEADERS_CONSUMER_SCHEMA = Type.Object<
  Record<keyof IHeaderConsumer, TSchema>
>(
  {
    'x-consumer-id': Type.Optional(Type.String()),
    'x-consumer-custom-id': Type.Optional(Nullable(Type.Number())),
    'x-consumer-username': Type.Optional(Type.String()),
    'x-consumer-groups': Type.Optional(StringArray<ConsumerGroups>()),
    [HeaderAnonymousConsumer]: Type.Optional(Type.Boolean()),
    [HeaderApiKey]: Type.Optional(Type.String())
  },
  {
    $id: HEADERS_CONSUMER_SCHEMA_NAME,
    description:
      'Standard consumer identification headers provided by the gateway.'
  }
);

export interface IHeaderConsumer {
  'x-consumer-id': string;
  'x-consumer-custom-id': string;
  'x-consumer-username': string;
  'x-consumer-groups'?: ConsumerGroups[];
  [HeaderAnonymousConsumer]?: boolean;
  [HeaderApiKey]?: string;
}

export interface IHeaderConsumerRaw extends IncomingHttpHeaders {
  'x-consumer-id': string;
  'x-consumer-custom-id': string;
  'x-consumer-username': string;
  'x-consumer-groups'?: string;
  [HeaderAnonymousConsumer]?: string;
  [HeaderApiKey]?: string;
}

export const REQUEST_WITH_HEADER_AUTH = {
  headers: HEADERS_CONSUMER_SCHEMA
} satisfies FastifySchema;
