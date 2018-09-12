import * as Joi from 'joi';

export class CatalogValidator {
  static updateModel = Joi.object().keys({
    title: Joi.string(),
    url: Joi.string(),
    options: Joi.object()
      .optional()
      .keys({
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
