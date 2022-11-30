import * as Joi from 'joi';

export class ProfilIgoValidator {
  static updateModel = Joi.object().keys({
    name: Joi.string().max(128),
    title: Joi.string().max(128),
    group: Joi.string().max(128),
    preference: Joi.object().optional(),
    canShare: Joi.boolean(),
    canShareToProfils: Joi.array().items(Joi.number()),
    canFilter: Joi.boolean(),
    guide: Joi.string()
  });

  static createModel = ProfilIgoValidator.updateModel.concat(
    Joi.object().keys({
      id: Joi.number().required(),
      name: Joi.required(),
      title: Joi.required()
    })
  );
}
