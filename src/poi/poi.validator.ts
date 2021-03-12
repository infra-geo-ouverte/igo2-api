import * as Joi from 'joi';

export class PoiValidator {
  static updateModel = Joi.object().keys({
    title: Joi.string(),
    x: Joi.number(),
    y: Joi.number(),
    zoom: Joi.number()
  });

  static createModel = PoiValidator.updateModel.concat(
    Joi.object().keys({
      title: Joi.required(),
      x: Joi.required(),
      y: Joi.required(),
      zoom: Joi.required()
    })
  );
}
