import * as Hapi from 'hapi';
import { IPlugin } from './plugins/interfaces';
import { IServerConfigurations } from './configurations';
import database from './database';
import * as Contexts from './contexts';


export function init(configs: IServerConfigurations): Promise<Hapi.Server> {
  return new Promise<Hapi.Server>(resolve => {
    const port = process.env.port || configs.port;
    const server = new Hapi.Server();

    server.connection({
      port: port,
      routes: {
        cors: true
      }
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
      Contexts.init(server, configs, database);
      console.log('Routes loaded');

      resolve(server);
    });

  });
}
