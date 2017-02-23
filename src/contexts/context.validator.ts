import * as Joi from 'joi';

export const createContextModel = Joi.object().keys({
  scope: Joi.string().required(),
  alias: Joi.string(),
  properties_map:  Joi.object().required().keys({
    center: Joi.string(),
    zoom: Joi.number()
  })
});

export const updateContextModel = Joi.object().keys({
    scope: Joi.string(),
    alias: Joi.string(),
    properties_map:  Joi.object().required().keys({
      center: Joi.string(),
      zoom: Joi.number()
    })
});
