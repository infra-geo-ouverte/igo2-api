import * as Joi from 'joi';

export const createLayerContextModel = Joi.object().keys({
  context_id: Joi.number().required(),
  layer_id: Joi.number().required(),
  view:  Joi.object().keys({
    attribution: Joi.string(),
    minZoom: Joi.number(),
    maxZoom: Joi.number()
  }),
  source:  Joi.object().keys({
    url: Joi.string()
  })
});

export const updateLayerContextModel = Joi.object().keys({
    context_id: Joi.number(),
    layer_id: Joi.number(),
    view:  Joi.object().keys({
      attribution: Joi.string(),
      minZoom: Joi.number(),
      maxZoom: Joi.number()
    }),
    source:  Joi.object().keys({
      url: Joi.string()
    })
});
