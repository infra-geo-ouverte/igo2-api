import * as Joi from 'joi';

export const createLayerModel = Joi.object().keys({
  title: Joi.string().required().max(64),
  type: Joi.string().required().max(32),
  url: Joi.string().allow(''),
  protected: Joi.boolean(),
  view:  Joi.object().keys({
    attribution: Joi.string().allow(''),
    minZoom: Joi.number(),
    maxZoom: Joi.number()
  }),
  source:  Joi.object().keys({
    url: Joi.string().allow(''),
    params: Joi.object()
  }),
  queryFormat: Joi.string().allow(''),
  queryTitle: Joi.string().allow('')
});

export const updateLayerModel = Joi.object().keys({
    title: Joi.string().max(64),
    type: Joi.string().max(32),
    url: Joi.string().allow(''),
    protected: Joi.boolean(),
    view:  Joi.object().keys({
      attribution: Joi.string().allow(''),
      minZoom: Joi.number(),
      maxZoom: Joi.number()
    }),
    source:  Joi.object().keys({
      url: Joi.string().allow(''),
      params: Joi.object()
    }),
    queryFormat: Joi.string().allow(''),
    queryTitle: Joi.string().allow('')
});
