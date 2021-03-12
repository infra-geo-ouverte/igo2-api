import * as Joi from 'joi';
import * as Boom from '@hapi/boom';

import { UserValidator } from '@igo2/base-api';

import { TypePermission } from './contextPermission.interface';
import { ContextPermissionService } from './contextPermission.service';

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
    const valid = UserValidator.notAnonymousValidator.validate(value);

    if (valid.error) {
      throw Boom.unauthorized('Must be authenticated');
    }

    const owner = value['x-consumer-username'];
    const contextId = options.context.params.contextId;
    const contextPermissionService = new ContextPermissionService();
    const permission = await contextPermissionService.getPermissionByContextId(contextId, owner);
    console.log(permission);
    console.log(owner);
    if (permission !== TypePermission.write) {
      console.log('nonnn');
      throw Boom.forbidden('Must have write permission for this context');
    }

    return new Promise((resolve) => {
      resolve(value);
    });
  };

  static readPermission = async (value, options) => {
    const valid = UserValidator.notAnonymousValidator.validate(value);

    if (valid.error) {
      throw Boom.unauthorized('Must be authenticated');
    }
    const owner = value['x-consumer-username'];
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

  static authenticatedAndReadPermission = async (value, options) => {
    const valid = UserValidator.notAnonymousValidator.validate(value);
    if (valid.error) {
      throw Boom.unauthorized('Must be authenticated');
    }

    return await ContextPermissionValidator.readPermission(value, options);
  };
}
