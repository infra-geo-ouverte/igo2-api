import * as Joi from 'joi';


export class CatalogValidator {

  static createModel = Joi.object().keys({
    title: Joi.string().required(),
    url: Joi.string().required(),
    options: Joi.object().optional().keys({
      regFilters: Joi.array().items(Joi.string()).optional()
    })
  });

  static updateModel = Joi.object().keys({
    title: Joi.string(),
    url: Joi.string(),
    options: Joi.object().optional().keys({
      regFilters: Joi.array().items(Joi.string()).optional()
    })
  });

}
