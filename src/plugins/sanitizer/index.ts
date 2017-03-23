import {IPlugin} from '../interfaces';
import * as Hapi from 'hapi';

const Sanitizer = require('./sanitizer');

export default (): IPlugin => {
  return {
    register: (server: Hapi.Server) => {
      return new Promise<void>(resolve => {
        server.register({
          register: Sanitizer
        }, (error) => {
          if (error) {
            console.log('error', error);
          }

          resolve();
        });
      });
    },
    info: () => {
      return {
        name: 'Sanitizer',
        version: '1.0.0'
      };
    }
  };
};
