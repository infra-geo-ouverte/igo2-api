import * as Joi from 'joi';
import * as Boom from 'boom';

import * as Configs from '../configurations';

import { User } from './user';

export class UserValidator {

  static updateModel = Joi.object().keys({
      email: Joi.string().email()
  });

  static loginModel = Joi.object().keys({
      username: Joi.string(),
      password: Joi.string().trim(),
      token: Joi.string(),
      typeConnection: Joi.string().valid('msp', 'facebook', 'google', 'test'),
  }).xor('username', 'token');

  static userValidator = Joi.object({
    'x-consumer-id': Joi.string().required(),
    'x-consumer-username': Joi.string().required()
  }).unknown();

  static notAnonymousValidator = UserValidator.userValidator.concat(
    Joi.object({
      'x-anonymous-consumer': Joi.boolean().forbidden()
    }).unknown()
  );

  static authenticateValidator = (value, options, next) => {

    const valid = Joi.validate(value, UserValidator.notAnonymousValidator);

    if (valid.error) {
      next(Boom.unauthorized('Must be authenticated'));
    } else {
      next(null, value, options, next);
    }
  }

  static adminValidator = (value, options, next) => {

    const valid = Joi.validate(value, UserValidator.notAnonymousValidator);

    if (valid.error) {
      next(Boom.unauthorized('Must be authenticated'));
    } else {
      const configs = Configs.getServerConfig();
      User.getProfils(value['x-consumer-id']).subscribe((profils) => {
        if (profils.includes(configs.adminProfil)) {
          next(null, value);
        } else {
          next(Boom.forbidden('Must be administrator'));
        }
      });
    }
  }

}
