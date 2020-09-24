import * as Joi from 'joi';

export class CatalogValidator {
  static updateModel = Joi.object().keys({
    title: Joi.string(),
    url: Joi.string(),
    order: Joi.number().optional(),
    profils: Joi.array().items(Joi.string().max(128)),
    options: Joi.object()
      .optional()
      .keys({
        sortDirection: Joi.string()
          .allow('asc', 'desc')
          .optional(),
        regFilters: Joi.array()
          .items(Joi.string())
          .optional()
      })
  });

  static createModel = CatalogValidator.updateModel.concat(
    Joi.object().keys({
      title: Joi.string().required(),
      url: Joi.string().required()
    })
  );
}
