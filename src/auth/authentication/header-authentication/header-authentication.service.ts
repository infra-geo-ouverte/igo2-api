import { IncomingHttpHeaders } from 'node:http2';

import Value from 'typebox/value';

import { IAuthService } from '../authentication.interface';
import {
  ConsumerGroups,
  IAnonymousConsumer,
  IAnyConsumer,
  ISystemConsumer,
  IUserConsumer
} from '../shared/consumer';
import { getConsumerSource } from '../shared/consumer/consumer.utils';
import {
  HEADERS_CONSUMER_SCHEMA,
  HeaderConsumer
} from './header-authentication.interface';

export class HeaderAuthenticationService implements IAuthService {
  getConsumer(headers: IncomingHttpHeaders): IAnyConsumer | undefined {
    const groups = this.getHeaderGroups(headers);
    const source = getConsumerSource(headers);
    const id = headers['x-consumer-id' as HeaderConsumer] as string;
    const username = headers['x-consumer-username' as HeaderConsumer] as string;

    if (!source) {
      return undefined;
    }

    switch (source) {
      case 'user':
        return {
          id,
          customId: Number(headers['x-consumer-custom-id' as HeaderConsumer]),
          username,
          groups,
          source: 'user'
        } satisfies IUserConsumer;
      case 'system':
        return {
          id,
          username,
          groups,
          source: 'system'
        } satisfies ISystemConsumer;
      default:
        return {
          id,
          username,
          groups,
          source: 'anonymous'
        } satisfies IAnonymousConsumer;
    }
  }

  private getHeaderGroups(headers: IncomingHttpHeaders): ConsumerGroups[] {
    const groupsSchema =
      HEADERS_CONSUMER_SCHEMA['properties']['x-consumer-groups'];
    return Value.Decode(
      groupsSchema,
      headers['x-consumer-groups']
    ) as ConsumerGroups[];
  }
}
