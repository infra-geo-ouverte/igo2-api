import * as Joi from 'joi';
import * as Boom from 'boom';

import * as Configs from '../configurations';

export class UserValidator {
  static updateModel = Joi.object().keys({
    email: Joi.string().email()
  });

  static loginModel = Joi.object()
    .keys({
      username: Joi.string().alphanum(),
      password: Joi.string().trim(),
      token: Joi.string(),
      typeConnection: Joi.string().valid('ldap', 'facebook', 'google', 'test')
    })
    .xor('username', 'token');

  static userValidator = Joi.object({
    'x-consumer-id': Joi.string().required(),
    'x-consumer-username': Joi.string().required()
  }).unknown();

  static notAnonymousValidator = UserValidator.userValidator.concat(
    Joi.object({
      'x-anonymous-consumer': Joi.boolean().forbidden()
    }).unknown()
  );

  static authenticateValidator = async (value, _options) => {
    const valid = Joi.validate(value, UserValidator.notAnonymousValidator);
    if (valid.error) {
      throw Boom.unauthorized('Must be authenticated');
    }
  };

  static adminValidator = async (value, _options) => {
    const valid = Joi.validate(value, UserValidator.notAnonymousValidator);
    if (valid.error) {
      throw Boom.unauthorized('Must be authenticated');
    }

    const configs = Configs.getServerConfig();
    const profils = value['x-consumer-groups'];
    if (!profils || !profils.split(', ').includes(configs.adminProfil)) {
      throw Boom.forbidden('Must be administrator');
    }
  };
}
