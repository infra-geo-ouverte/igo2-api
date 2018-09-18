import * as Joi from 'joi';

export class UserIgoValidator {
  static updateModel = Joi.object().keys({
    defaultContext: Joi.string()
  });

  static createModel = UserIgoValidator.updateModel.concat(
    Joi.object().keys({
      defaultContext: Joi.required()
    })
  );
}
