import * as Hapi from 'hapi';

import { IPlugin, IPluginOptions } from '../interfaces';
import { Sanitizer } from './sanitizer';
import {
  defaults,
  SanitizerSchema,
  SanitizerOptions
} from './sanitizer.options';

export default (): IPlugin => {
  return {
    name: 'Sanitizer',
    version: '1.0.0',
    register: async (server: Hapi.Server, options: IPluginOptions = {}) => {
      const result = SanitizerSchema.validate(options.sanitizer);
      const sanitizerDefaultOpt: SanitizerOptions = Object.assign(
        {},
        defaults,
        result.value
      );

      if (result.error) {
        throw result.error;
      }

      server.ext(
        'onPostAuth',
        (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
          const sanitizerOpt: SanitizerOptions = Object.assign(
            {},
            sanitizerDefaultOpt,
            (request.route.settings.plugins as any).sanitize
          );

          if (!sanitizerOpt.enabled) {
            return h.continue;
          }

          if (
            request.payload ||
            Object.keys(request.params).length ||
            Object.keys(request.query).length
          ) {
            (request as any).payload = Sanitizer.sanitize(request.payload);
            (request as any).query = Sanitizer.sanitize(request.query);
            (request as any).params = Sanitizer.sanitize(request.params);
          }

          return h.continue;
        }
      );
    }
  };
};
