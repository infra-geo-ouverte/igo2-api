import * as Joi from 'joi';
import * as Boom from '@hapi/boom';

import { TypePermission } from './contextPermission.interface';
import { ContextPermissionService } from './contextPermission.service';
import { LoginValidator } from '../login/login.validator';
import { TokenToUser } from '../utils/token';

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
    const valid = LoginValidator.userValidator.validate(value);

    if (valid.error) {
      throw Boom.unauthorized('Must be authenticated');
    }

    const requestedUser = TokenToUser(value.authorization.split(' ')[1]);
    const owner = requestedUser.sourceId;
    const contextId = options.context.params.contextId;
    const contextPermissionService = new ContextPermissionService();
    const permission = await contextPermissionService.getPermissionByContextId(contextId, owner);
    if (permission !== TypePermission.write) {
      throw Boom.forbidden('Must have write permission for this context');
    }

    return new Promise((resolve) => {
      resolve(value);
    });
  };

  static readPermission = async (value, options) => {
    const valid = LoginValidator.userValidator.validate(value);

    if (valid.error) {
      throw Boom.unauthorized('Must be authenticated');
    }
    const requestedUser = TokenToUser(value.authorization.split(' ')[1]);
    const owner = requestedUser.sourceId;
    const contextId = options.context.params.contextId;
    const contextPermissionService = new ContextPermissionService();
    const permission = await contextPermissionService.getPermissionByContextId(contextId, owner);

    if (!permission) {
      throw Boom.forbidden('Must have read permission for this context');
    }

    return new Promise((resolve) => {
      resolve(value);
    });
  };
}
