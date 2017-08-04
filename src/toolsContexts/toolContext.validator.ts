import * as Joi from 'joi';

export const createToolContextModel = Joi.object().keys({
  toolId: Joi.number().required(),
  options:  Joi.object().keys({
    attribution: Joi.string().allow(''),
    minZoom: Joi.number(),
    maxZoom: Joi.number()
  })
});

export const updateToolContextModel = Joi.object().keys({
    options:  Joi.object().keys({
      attribution: Joi.string().allow(''),
      minZoom: Joi.number(),
      maxZoom: Joi.number()
    })
});
