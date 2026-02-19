import { IncomingHttpHeaders } from 'node:http';

import {
  HeaderAnonymousConsumer,
  HeaderApiKey,
  HeaderConsumer
} from '../../header-authentication';
import {
  IAnonymousConsumer,
  IAnyConsumer,
  IConsumerSource,
  ISystemConsumer,
  IUserConsumer
} from './consumer.interface';

export function isSystemConsumer(
  consumer: IAnyConsumer
): consumer is ISystemConsumer {
  return consumer.source === 'system';
}

export function isUserConsumer(
  consumer: IAnyConsumer
): consumer is IUserConsumer {
  return consumer.source === 'user';
}

export function isAnonymousConsumer(
  consumer: IAnyConsumer
): consumer is IAnonymousConsumer {
  return consumer.source === 'anonymous';
}

export function getConsumerSource(
  headers: IncomingHttpHeaders
): IConsumerSource | undefined {
  const customId = headers['x-consumer-custom-id' as HeaderConsumer];
  const anonymous = hasAnonymousConsumerHeader(headers);

  if (anonymous) {
    return 'anonymous';
  } else if (customId == null && headers[HeaderApiKey]) {
    return 'system';
  } else if (customId != null) {
    return 'user';
  } else {
    return undefined;
  }
}

function hasAnonymousConsumerHeader(headers: IncomingHttpHeaders): boolean {
  return String(headers[HeaderAnonymousConsumer]).toLowerCase() === 'true';
}
