import * as Hapi from 'hapi';
import { IPlugin } from './plugins/interfaces';
import { IServerConfiguration } from './configurations';
import database from './database';

interface IRoute {
  init(server: Hapi.Server): void;
}

const loadPlugins = (configs: IServerConfiguration, server: Hapi.Server) => {
  //  Setup Hapi Plugins
  const plugins: Array<string> = configs.plugins || [];
  const pluginOptions = configs.pluginsOptions || {};
  pluginOptions.database = database;
  pluginOptions.configs = configs;

  plugins.forEach((pluginName: string) => {
    const plugin: IPlugin = require('./plugins/' + pluginName).default();
    const version = plugin.version;
    const name = plugin.name;
    console.log(`Register Plugin ${name} v${version}`);
    plugin.register(server, pluginOptions);
  });
  console.log('Plugins loaded');
};

const loadRoutes = (configs: IServerConfiguration, server: Hapi.Server) => {
  console.log('Routes loading');
  const routes: Array<string> = configs.routes || [];
  routes.forEach((routeName: string) => {
    const Route: IRoute = require('./' + routeName);
    Route.init(server);
  });
  console.log('Routes loaded');
};

export async function init(
  configs: IServerConfiguration
): Promise<Hapi.Server> {
  const port = process.env.port || configs.port;
  const server = new Hapi.Server({
    port: port,
    host: 'localhost'
  });

  await loadPlugins(configs, server);
  await loadRoutes(configs, server);
  return server;
}
