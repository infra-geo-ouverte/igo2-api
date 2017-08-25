import * as Hapi from 'hapi';
import { IPlugin } from './plugins/interfaces';
import { IServerConfiguration } from './configurations';
import database from './database';
import * as Users from './user';
import * as POIs from './poi';
import * as Contexts from './context';
import * as Layers from './layer';
import * as Tools from './tool';
import * as LayersContexts from './layerContext';
import * as ToolsContexts from './toolContext';
import * as ContextsPermissions from './contextPermission';

export function init(configs: IServerConfiguration): Promise<Hapi.Server> {
  return new Promise<Hapi.Server>(resolve => {
    const port = process.env.port || configs.port;
    const server = new Hapi.Server();

    server.connection({
      port: port
    });

    //  Setup Hapi Plugins
    const plugins: Array<string> = configs.plugins;
    const pluginOptions = {
      database: database,
      serverConfigs: configs
    };

    const pluginPromises = [];
    plugins.forEach((pluginName: string) => {
      const plugin: IPlugin = (require('./plugins/' + pluginName)).default();
      const version = plugin.info().version;
      const name = plugin.info().name;
      console.log(`Register Plugin ${name} v${version}`);
      pluginPromises.push(plugin.register(server, pluginOptions));
    });

    Promise.all(pluginPromises).then(() => {
      console.log('Plugins loaded');

      // Init Features
      console.log('Routes loading');
      Users.init(server);
      POIs.init(server);
      Contexts.init(server);
      Layers.init(server);
      Tools.init(server);
      ToolsContexts.init(server);
      LayersContexts.init(server);
      ContextsPermissions.init(server);
      console.log('Routes loaded');

      resolve(server);
    });

  });
}
