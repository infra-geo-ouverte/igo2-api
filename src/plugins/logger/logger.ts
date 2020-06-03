import { Stream } from 'stream';
import * as SafeStringify from 'json-stringify-safe';

import { LoggerOptions } from './logger.options';

export class GoodConsole extends Stream.Transform {
  constructor(private settings: LoggerOptions = {}) {
    super({ objectMode: true });
  }

  _transform(data: any, _enc: any, next: any) {
    if (data.headers) {
      const ip = data.headers['x-real-ip'];
      if (this.settings.exclude && this.settings.exclude.ips && this.settings.exclude.ips.includes(ip)) {
        return next();
      }
    }

    const eventName = data.event;
    let tags = [];

    if (Array.isArray(data.tags)) {
      tags = data.tags.concat([]);
    } else if (data.tags) {
      tags = [data.tags];
    }

    tags.unshift(eventName);

    if (eventName === 'error' || data.error instanceof Error) {
      return next(null, this.formatError(data, tags));
    }

    if (eventName === 'ops') {
      return next(null, this.formatOps(data, tags));
    }

    if (eventName === 'response') {
      return next(null, this.formatResponse(data, tags));
    }

    if (!data.data) {
      data.data = '(none)';
    }

    return next(null, this.formatDefault(data, tags));
  }

  formatOutput(event: any) {
    const timestamp = new Date(event.timestamp).toLocaleString('fr-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    event.tags = event.tags.toString();
    const tags = ` [${event.tags}]`;

    const id = event.id ? ` (${event.id})` : '';

    const headers = event.headers || {};
    const ip = headers['x-real-ip'] ? ` - ${headers['x-real-ip']}` : '';
    const username = headers['x-consumer-username'] ? ` - ${headers['x-consumer-username']}` : '';

    return `${timestamp}${id}${tags}${ip}${username} - ${event.data}\n`;
  }

  formatMethod(method: string) {
    const methodColors = {
      get: 32,
      delete: 31,
      put: 36,
      post: 33
    };

    let formattedMethod = method.toLowerCase();

    const color = methodColors[method.toLowerCase()] || 34;
    formattedMethod = `\x1b[1;${color}m${formattedMethod}\x1b[0m`;

    return formattedMethod;
  }

  formatStatusCode(statusCode: number) {
    let color: number;
    if (statusCode) {
      color = 32;
      if (statusCode >= 500) {
        color = 31;
      } else if (statusCode >= 400) {
        color = 33;
      } else if (statusCode >= 300) {
        color = 36;
      }

      return `\x1b[${color}m${statusCode}\x1b[0m`;
    }

    return statusCode;
  }

  formatResponse(event: any, tags: any) {
    const query = event.query ? SafeStringify(event.query) : '';
    const method = this.formatMethod(event.method);
    const statusCode = this.formatStatusCode(event.statusCode) || '';

    const output = `${event.instance}: ${method} ${event.path} ${query} ${statusCode} (${event.responseTime}ms)`;

    const response = {
      id: event.id,
      timestamp: event.timestamp,
      headers: event.headers,
      tags,
      data: output
    };

    return this.formatOutput(response);
  }

  formatOps(event: any, tags: any) {
    const memory = Math.round(event.proc.mem.rss / (1024 * 1024));
    const output = `memory: ${memory}Mb, uptime (seconds): ${event.proc.uptime}, load: [${event.os.load}]`;

    const ops = {
      timestamp: event.timestamp,
      tags,
      data: output
    };

    return this.formatOutput(ops);
  }

  formatError(event: any, tags: any) {
    const output = `message: ${event.error.message}, stack: ${event.error.stack}`;

    const error = {
      id: event.id,
      timestamp: event.timestamp,
      headers: event.headers,
      tags,
      data: output
    };

    return this.formatOutput(error);
  }

  formatDefault(event: any, tags: any) {
    const data = typeof event.data === 'object' ? JSON.stringify(event.data) : event.data;
    const output = `${data}`;

    const defaults = {
      id: event.id,
      timestamp: event.timestamp,
      headers: event.headers,
      tags,
      data: output
    };

    return this.formatOutput(defaults);
  }
}
