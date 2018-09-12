import * as Joi from 'joi';

export class POIValidator {
  static updateModel = Joi.object().keys({
    title: Joi.string(),
    x: Joi.number(),
    y: Joi.number(),
    zoom: Joi.number()
  });

  static createModel = POIValidator.updateModel.concat(
    Joi.object().keys({
      title: Joi.required(),
      x: Joi.required(),
      y: Joi.required(),
      zoom: Joi.required()
    })
  );
}
