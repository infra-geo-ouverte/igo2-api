import * as Joi from 'joi';

export const createContextModel = Joi.object().keys({
  scope: Joi.string().required().valid('public', 'protected', 'private'),
  alias: Joi.string(),
  properties_map:  Joi.object().required().keys({
    center: Joi.string(),
    zoom: Joi.number()
  })
});

export const updateContextModel = Joi.object().keys({
    scope: Joi.string().valid('public', 'protected', 'private'),
    alias: Joi.string(),
    properties_map:  Joi.object().required().keys({
      center: Joi.string(),
      zoom: Joi.number()
    })
});
