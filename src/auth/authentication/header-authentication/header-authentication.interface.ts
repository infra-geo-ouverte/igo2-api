import { FastifySchema } from 'fastify';

import { StringArray } from '@igo2/fastify';
import { IncomingHttpHeaders } from 'http';
import { TSchema, Type } from 'typebox';

import { ConsumerGroups } from '../authentication.interface';

export const HeaderAnoymousConsumer = 'x-anonymous-consumer' as const;

export const HeaderConsumers = [
  'x-consumer-id',
  'x-consumer-custom-id',
  'x-consumer-username',
  'x-consumer-groups',
  HeaderAnoymousConsumer
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
    'x-consumer-custom-id': Type.Optional(Type.Number()),
    'x-consumer-username': Type.Optional(Type.String()),
    'x-consumer-groups': Type.Optional(StringArray<ConsumerGroups>()),
    'x-anonymous-consumer': Type.Optional(Type.Boolean())
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
  'x-anonymous-consumer'?: boolean;
}

export interface IHeaderConsumerRaw extends IncomingHttpHeaders {
  'x-consumer-id': string;
  'x-consumer-custom-id': string;
  'x-consumer-username': string;
  'x-consumer-groups'?: string;
  'x-anonymous-consumer'?: string;
}

export const REQUEST_WITH_HEADER_AUTH = {
  headers: HEADERS_CONSUMER_SCHEMA
} satisfies FastifySchema;
