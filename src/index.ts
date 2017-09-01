import * as Server from './server';
import * as Configs from './configurations';

console.log(`Running enviroment ${process.env.NODE_ENV || 'dev'}`);

// Starting Application Server
const serverConfigs = Configs.getServerConfig();
Server.init(serverConfigs).then((server) => {
  server.start(() => {
    console.log('Server running at:', server.info.uri);
  });
});
