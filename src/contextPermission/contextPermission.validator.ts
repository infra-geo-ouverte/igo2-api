import * as Joi from 'joi';
import * as Boom from 'boom';

import { UserValidator } from '../user/user.validator';

import { TypePermission } from './contextPermission.model';
import { ContextPermission } from './contextPermission';

export class ContextPermissionValidator {
  static createModel = Joi.object().keys({
    profil: Joi.string().required(),
    typePermission: Joi.string().valid('read', 'write')
  });

  static updateModel = Joi.object().keys({
    profil: Joi.string(),
    typePermission: Joi.string().valid('read', 'write')
  });

  static writePermission = async (value, options) => {
    const valid = Joi.validate(value, UserValidator.notAnonymousValidator);

    if (valid.error) {
      throw Boom.unauthorized('Must be authenticated');
    }

    const owner = value['x-consumer-username'];
    const contextId = options.context.params['contextId'];
    const contextPermission = new ContextPermission();
    const permission = await contextPermission.getPermissionByContextId(
      contextId,
      owner
    );

    if (permission !== TypePermission.write) {
      throw Boom.forbidden('Must have write permission for this context');
    }
  };

  static readPermission = async (value, options) => {
    const valid = Joi.validate(value, UserValidator.userValidator);

    if (valid.error) {
      throw Boom.unauthorized('Must be authenticated');
    }
    const owner = value['x-consumer-username'];
    const contextId = options.context.params['contextId'];
    const contextPermission = new ContextPermission();
    const permission = await contextPermission.getPermissionByContextId(
      contextId,
      owner
    );

    if (!permission) {
      throw Boom.forbidden('Must have read permission for this context');
    }
  };

  static authenticatedAndReadPermission = async (value, options) => {
    const valid = Joi.validate(value, UserValidator.notAnonymousValidator);
    if (valid.error) {
      throw Boom.unauthorized('Must be authenticated');
    }

    await ContextPermissionValidator.readPermission(value, options);
  };
}
