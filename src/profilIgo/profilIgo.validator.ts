import * as Joi from 'joi';

export class ProfilIgoValidator {
  static updateModel = Joi.object().keys({
    title: Joi.string().max(128),
    group: Joi.string().max(128),
    canShare: Joi.boolean()
  });

  static createModel = ProfilIgoValidator.updateModel.concat(
    Joi.object().keys({
      id: Joi.number().required(),
      name: Joi.required(),
      title: Joi.required()
    })
  );
}
