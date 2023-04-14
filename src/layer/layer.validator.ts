import * as Joi from 'joi';

export class LayerValidator {
  static layerOptionsModel = Joi.object()
    .keys({
      title: Joi.string(),
      baseLayer: Joi.boolean(),
      opacity: Joi.number(),
      visible: Joi.boolean(),
      extent: Joi.array().items(
        Joi.number()
          .min(4)
          .max(4)
      ),
      zIndex: Joi.number(),
      minResolution: Joi.number(),
      maxResolution: Joi.number()
    })
    .unknown(true);

  static sourceOptionsModel = Joi.object()
    .keys({
      type: Joi.string().required(),
      url: Joi.string().required(),
      params: Joi.object(),
      paramsWFS: Joi.object(),
      ogcFilters: Joi.object(),
      crossOrigin: Joi.string(),
      optionsFromCapabilities: Joi.boolean(),
      optionsFromApi: Joi.boolean(),
      queryable: Joi.boolean(),
      queryTitle: Joi.string(),
      timeFilterable: Joi.boolean(),
      timeFilter: Joi.object()
    })
    .unknown(true);

  static updateModel = Joi.object().keys({
    layerOptions: LayerValidator.layerOptionsModel,
    sourceOptions: LayerValidator.sourceOptionsModel,
    profils: Joi.array().items(Joi.string().max(128)),
    global: Joi.boolean(),
    enabled: Joi.boolean().optional()
  });

  static createModel = LayerValidator.updateModel;
}
