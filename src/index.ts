import { Config, Server } from '@igo2/base-api';

Config.readConfig(__dirname, `configurations/config.${process.env.NODE_ENV || 'dev'}.json`);

// Starting Application Server
Server.start();
