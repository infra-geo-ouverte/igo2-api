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

  static writePermission = (value, options, next) => {

    const valid = Joi.validate(value, UserValidator.notAnonymousValidator);

    if (valid.error) {
      next(Boom.unauthorized('Must be authenticated'));
    } else {
      const owner = value['x-consumer-username'];
      const contextId = options.context.params['contextId'];
      const contextPermission = new ContextPermission();
      contextPermission.getPermissionByContextId(contextId, owner).subscribe(
        (permission) => {
          if (permission === TypePermission.write) {
            next(null, value);
          } else {
            next(Boom.forbidden('Must have write permission for this context'));
          }
        },
        (error: Boom.BoomError) => next(error)
      );
    }
  }

  static readPermission = (value, options, next) => {

    const valid = Joi.validate(value, UserValidator.userValidator);

    if (valid.error) {
      next(Boom.unauthorized('Must be authenticated'));
    } else {
      const owner = value['x-consumer-username'];
      const contextId = options.context.params['contextId'];
      const contextPermission = new ContextPermission();
      contextPermission.getPermissionByContextId(contextId, owner).subscribe(
        (permission) => {
          if (permission) {
            next(null, value);
          } else {
            next(Boom.forbidden('Must have read permission for this context'));
          }
        },
        (error: Boom.BoomError) => next(error)
      );
    }
  }

  static authenticatedAndReadPermission = (value, options, next) => {

    const valid = Joi.validate(value, UserValidator.notAnonymousValidator);

    if (valid.error) {
      next(Boom.unauthorized('Must be authenticated'));
    } else {
      ContextPermissionValidator.readPermission(value, options, next);
    }
  }

}
