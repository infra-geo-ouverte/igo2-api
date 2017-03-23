const Hoek = require('hoek');
const Joi = require('joi');
const xss = require('xss');

let interne = {
  schema: Joi.object().keys({
    sanitize: Joi.boolean().optional()
  }),

  defaults: {
    sanitize: true
  },

  sanitize: (obj) => {
    return JSON.parse(xss(JSON.stringify(obj)));
  }
};


let myPlugin: any = {
  register: (server, options, next) => {
    const validateOptions = interne.schema.validate(options);
    if (validateOptions.error) {
      return next(validateOptions.error);
    }

    const serverSettings = Hoek.applyToDefaults(interne.defaults, options);

    server.ext('onPostAuth', (request, reply) => {
      if (request.route.settings.plugins.sanitize === false) {
        return reply.continue();
      }

      if (request.payload || Object.keys(request.params).length ||
          Object.keys(request.query).length) {

        request.route.settings.plugins._disinfect = Hoek.applyToDefaults(
          serverSettings,
          request.route.settings.plugins.disinfect || {}
        );

        request.payload = interne.sanitize(request.payload);
        request.query = interne.sanitize(request.query);
        request.params = interne.sanitize(request.params);
      }

      return reply.continue();
    });

    return next();
  }
};



myPlugin.register.attributes = {
  name: 'myplugin',
  version: '1.0.0'
};

module.exports = myPlugin;
