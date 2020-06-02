import * as Joi from 'joi';

export class ProfilIgoValidator {
  static updateModel = Joi.object().keys({
    title: Joi.string().max(128)
  });

  static createModel = ProfilIgoValidator.updateModel.concat(
    Joi.object().keys({
      name: Joi.string()
        .max(128)
        .required(),
      title: Joi.required()
    })
  );
}
