import * as Joi from 'joi';
import * as Boom from '@hapi/boom';
import { TokenToUser } from '../utils';

export class LoginValidator {
  static model = Joi.object().keys({
    username: Joi.required(),
    password: Joi.required()
  });

  static userValidator = Joi.object({
    authorization: Joi.string().required()
  }).unknown();

  static TokenValidator (value: object, _options?: Joi.ValidationOptions) {
    const valid = LoginValidator.userValidator.validate(value);
    if (valid.error) {
      throw Boom.unauthorized('Must be authenticated');
    }
    return new Promise((resolve) => {
      resolve(value);
    });
  }

  static adminTokenValidator (value: object, _options?: Joi.ValidationOptions) {
    const valid = LoginValidator.userValidator.validate(value);
    if (valid.error) {
      throw Boom.unauthorized('Must be authenticated');
    }
    const user = TokenToUser((value as any).authorization.split(' ')[1]);
    if (!user.isAdmin) {
      throw Boom.forbidden('Must be administrator');
    }
    return new Promise((resolve) => {
      resolve(value);
    });
  }
}
