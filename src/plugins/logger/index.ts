import { IPlugin, IPluginOptions } from '../interfaces';
import * as Hapi from 'hapi';

import { GoodConsole } from './logger';

export default (): IPlugin => {
  return {
    name: 'Good Logger',
    version: '1.0.0',
    register: async (server: Hapi.Server, options: IPluginOptions = {}) => {
      const opts = {
        ops: false,
        includes: {
          request: ['headers']
        },
        reporters: {
          myConsoleReporter: [new GoodConsole(options.logger), 'stdout']
        }
      };

      await server.register({
        plugin: require('good'),
        options: opts
      });
    }
  };
};
