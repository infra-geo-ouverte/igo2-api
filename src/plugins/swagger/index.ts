import * as Hapi from 'hapi';
import { IPlugin, IPluginOptions } from '../interfaces';
import { defaults, SwaggerSchema, SwaggerOptions } from './swagger.options';

export default (): IPlugin => {
  return {
    name: 'Swagger Documentation',
    version: '1.0.0',
    register: async (server: Hapi.Server, options: IPluginOptions = {}) => {
      const result = SwaggerSchema.validate(options.swagger);
      const swaggerOptions: SwaggerOptions = Object.assign(
        {},
        defaults,
        result.value
      );

      if (result.error) {
        throw result.error;
      }

      await server.register([
        require('inert'),
        require('vision'),
        {
          plugin: require('hapi-swagger'),
          options: swaggerOptions
        }
      ]);
    }
  };
};
