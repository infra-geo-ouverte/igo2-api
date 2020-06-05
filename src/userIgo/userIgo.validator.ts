import * as Joi from 'joi';

export class UserIgoValidator {
  static updateModel = Joi.object().keys({
    defaultContext: Joi.string(),
    preference: Joi.object()
  });

  static createModel = UserIgoValidator.updateModel;
}
