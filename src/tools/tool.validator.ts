import * as Joi from 'joi';

export const createToolModel = Joi.object().keys({
  name: Joi.string().max(64),
  url: Joi.string(),
  protected: Joi.boolean(),
  properties:  Joi.object().required().keys({
    attribution: Joi.string(),
    minZoom: Joi.number(),
    maxZoom: Joi.number()
  })
});

export const updateToolModel = Joi.object().keys({
    name: Joi.string().max(64),
    url: Joi.string(),
    protected: Joi.boolean(),
    properties:  Joi.object().required().keys({
      attribution: Joi.string(),
      minZoom: Joi.number(),
      maxZoom: Joi.number()
    })
});
