import * as Joi from 'joi';

export const createLayerModel = Joi.object().keys({
  title: Joi.string().required().max(64),
  type: Joi.string().required().max(32),
  url: Joi.string(),
  protected: Joi.boolean(),
  view:  Joi.object().keys({
    attribution: Joi.string(),
    minZoom: Joi.number(),
    maxZoom: Joi.number()
  }),
  source:  Joi.object().keys({
    url: Joi.string(),
    params: Joi.object()
  }),
  queryFormat: Joi.string(),
  queryTitle: Joi.string()
});

export const updateLayerModel = Joi.object().keys({
    title: Joi.string().max(64),
    type: Joi.string().max(32),
    url: Joi.string(),
    protected: Joi.boolean(),
    view:  Joi.object().keys({
      attribution: Joi.string(),
      minZoom: Joi.number(),
      maxZoom: Joi.number()
    }),
    source:  Joi.object().keys({
      url: Joi.string(),
      params: Joi.object()
    }),
    queryFormat: Joi.string(),
    queryTitle: Joi.string()
});
