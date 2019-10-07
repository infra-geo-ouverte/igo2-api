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
      type: Joi.string(),
      url: Joi.string().allow(''),
      params: Joi.object(),
      version: Joi.string().allow('')
    })
    .unknown(true);

  static createModel = Joi.object().keys({
    layerOptions: LayerValidator.layerOptionsModel,
    sourceOptions: LayerValidator.sourceOptionsModel.concat(
      Joi.object()
        .required()
        .keys({
          type: Joi.required()
        })
    )
  });

  static updateModel = Joi.object().keys({
    layerOptions: LayerValidator.layerOptionsModel,
    sourceOptions: LayerValidator.sourceOptionsModel
  });
}
