import * as Joi from 'joi';


export class CatalogValidator {

  static createModel = Joi.object().keys({
    title: Joi.string().required(),
    url: Joi.string().required()
  });

  static updateModel = Joi.object().keys({
    title: Joi.string(),
    url: Joi.string()
  });

}
