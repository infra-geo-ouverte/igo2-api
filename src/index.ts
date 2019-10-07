import * as Server from './server';
import * as Configs from './configurations';

console.log(`Running enviroment ${process.env.NODE_ENV || 'dev'}`);

// Starting Application Server
const serverConfigs = Configs.getServerConfig();

if (serverConfigs.apm) {
  require('elastic-apm-node').start({
    serviceName: serverConfigs.apm.name,
    serverUrl: serverConfigs.apm.url,
    verifyServerCert: false
  });
}


const start = async () => {
  const server = await Server.init(serverConfigs);
  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', err => {
  console.log(err);
  process.exit(1);
});

start();
