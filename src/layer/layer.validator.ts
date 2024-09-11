import * as Joi from 'joi';

export class LayerValidator {
  static layerOptionsModel = Joi.object()
    .keys({
      title: Joi.string(),
      baseLayer: Joi.boolean(),
      opacity: Joi.number(),
      visible: Joi.boolean(),
      extent: Joi.array().length(4).items(Joi.number()),
      zIndex: Joi.number(),
      minResolution: Joi.number(),
      maxResolution: Joi.number()
    })
    .unknown(true);

  static sourceOptionsModel = Joi.object()
    .keys({
      params: Joi.object(),
      version: Joi.string().allow('')
    })
    .unknown(true);

  static updateModel = Joi.object().keys({
    type: Joi.string(),
    url: Joi.string(),
    layers: Joi.string(),
    layerOptions: LayerValidator.layerOptionsModel,
    sourceOptions: LayerValidator.sourceOptionsModel
  });

  static createModel = LayerValidator.updateModel.append({
    type: Joi.string().required()
  });
}
