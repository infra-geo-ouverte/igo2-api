import * as Joi from 'joi';


export class POIValidator {

  static createModel = Joi.object().keys({
    title: Joi.string().required(),
    x: Joi.number().required(),
    y: Joi.number().required(),
    zoom: Joi.number().required(),
  });

  static updateModel = Joi.object().keys({
    title: Joi.string(),
    x: Joi.number(),
    y: Joi.number(),
    zoom: Joi.number(),
  });

}
