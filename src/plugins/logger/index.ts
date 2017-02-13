import { IPlugin } from "../interfaces";
import * as Hapi from "hapi";

export default (): IPlugin => {
    return {
        register: (server: Hapi.Server) => {
          return new Promise<void>(resolve => {
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

            server.register({
              register: require('good'),
              options: opts
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
                name: "Good Logger",
                version: "1.0.0"
            };
        }
    };
};
