import * as Hapi from 'hapi';
import * as apm from 'elastic-apm-node';

import { IPlugin, IPluginOptions } from '../interfaces';
import { ApmOptions } from './apm.options';

export default (): IPlugin => {
  return {
    name: 'apm',
    version: '1.0.0',
    register: async (server: Hapi.Server, options: IPluginOptions) => {
      const apmOptions: ApmOptions = options.apm || {};
      if (!apmOptions.name || !apmOptions.url) {
        server.log('Warn', 'APM options are required');
        return;
      }

      apm.start({
        serviceName: apmOptions.name,
        serverUrl: apmOptions.url,
        verifyServerCert: false
      });

      server.ext('onPreHandler', (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
        const routeApm = request.route.method.toUpperCase() + ' ' + request.route.path;

        apm.setTransactionName(routeApm);

        return h.continue;
      });
    }
  };
};
