import * as Joi from 'joi';

export const createLayerContextModel = Joi.object().keys({
  context_id: Joi.number().required(),
  layer_id: Joi.number().required(),
  properties:  Joi.object().required().keys({
    attribution: Joi.string(),
    minZoom: Joi.number(),
    maxZoom: Joi.number()
  })
});

export const updateLayerContextModel = Joi.object().keys({
    context_id: Joi.number(),
    layer_id: Joi.number(),
    properties:  Joi.object().required().keys({
      attribution: Joi.string(),
      minZoom: Joi.number(),
      maxZoom: Joi.number()
    })
});
