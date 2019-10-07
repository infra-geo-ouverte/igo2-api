import { IPlugin } from '../interfaces';
import * as Hapi from 'hapi';

export default (): IPlugin => {
  return {
    name: 'Good Logger',
    version: '1.0.0',
    register: async (server: Hapi.Server) => {
      const opts = {
        ops: {
          interval: 60000
        },
        reporters: {
          myConsoleReporter: [
            {
              module: 'good-console'
            },
            'stdout'
          ]
        }
      };

      await server.register({
        plugin: require('good'),
        options: opts
      });
    }
  };
};
