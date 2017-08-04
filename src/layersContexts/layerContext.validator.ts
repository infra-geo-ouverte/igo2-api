import * as Joi from 'joi';

export const createLayerContextModel = Joi.object().keys({
  layerId: Joi.number().required(),
  view:  Joi.object().keys({
    attribution: Joi.string().allow(''),
    minZoom: Joi.number(),
    maxZoom: Joi.number()
  }),
  source:  Joi.object().keys({
    url: Joi.string().allow('')
  })
});

export const updateLayerContextModel = Joi.object().keys({
    view:  Joi.object().keys({
      attribution: Joi.string().allow(''),
      minZoom: Joi.number(),
      maxZoom: Joi.number()
    }),
    source:  Joi.object().keys({
      url: Joi.string().allow('')
    })
});
