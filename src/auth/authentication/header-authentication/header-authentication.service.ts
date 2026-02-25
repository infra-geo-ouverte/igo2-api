import { IncomingHttpHeaders } from 'node:http2';

import Value from 'typebox/value';

import {
  ConsumerGroups,
  IAuthService,
  IConsumer
} from '../authentication.interface';
import {
  HEADERS_CONSUMER_SCHEMA,
  HeaderAnoymousConsumer,
  HeaderConsumer
} from './header-authentication.interface';

export class HeaderAuthenticationService implements IAuthService {
  getConsumer(incomingHeaders: IncomingHttpHeaders): IConsumer {
    const headers = this.formatHeaders(incomingHeaders);

    const isAnonymous =
      String(headers[HeaderAnoymousConsumer]).toLowerCase() === 'true';

    const groups = (headers['x-consumer-groups' as HeaderConsumer] ??
      []) as ConsumerGroups[];

    const customId = Number(headers['x-consumer-custom-id' as HeaderConsumer]);

    return {
      id: headers['x-consumer-id' as HeaderConsumer] as string,
      customId,
      username: headers['x-consumer-username' as HeaderConsumer] as string,
      groups,
      isAnonymous
    };
  }

  /**
   * Decodes specific headers (like groups) without mutating the original headers object.
   */
  private formatHeaders(
    incomingHeaders: IncomingHttpHeaders
  ): IncomingHttpHeaders {
    const xConsumerGroupsKey = 'x-consumer-groups' satisfies HeaderConsumer;
    const groupsHeader = incomingHeaders[xConsumerGroupsKey];

    if (!groupsHeader) {
      return incomingHeaders;
    }

    return {
      ...incomingHeaders,
      [xConsumerGroupsKey]: Value.Decode(
        HEADERS_CONSUMER_SCHEMA['properties'][xConsumerGroupsKey],
        groupsHeader
      )
    };
  }
}
