import {IPlugin} from '../interfaces';
import * as Hapi from 'hapi';

export default (): IPlugin => {
    return {
        register: (server: Hapi.Server) => {
          return new Promise<void>(resolve => {
            server.register([
                require('inert'),
                require('vision'),
                {
                  register: require('hapi-swagger'),
                  options: {
                    basePath: '/igo2/api/',
                    info: {
                      title: 'Igo2 Api',
                      description: 'Igo2 Api Documentation',
                      version: '0.4.0'
                    },
                    tags: [
                      {
                        'name': 'contexts',
                        'description': 'Api contexts interface.'
                      },
                      {
                        'name': 'layers',
                        'description': 'Api layers interface.'
                      },
                      {
                        'name': 'users',
                        'description': 'Api users interface.'
                      }
                    ],
                    documentationPath: '/docs',
                    jsonPath: '/igo2/api/swagger.json',
                    lang: 'fr'
                    //  swaggerUIPath: '/igo2/api/swaggerui/'

                  }
                }
              ], (error) => {
                if (error) {
                  console.log('error', error);
                }

                resolve();
              });
          });
        },
        info: () => {
            return {
                name: 'Swagger Documentation',
                version: '1.0.0'
            };
        }
    };
};
