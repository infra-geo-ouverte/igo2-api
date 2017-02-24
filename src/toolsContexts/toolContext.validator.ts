import * as Joi from 'joi';

export const createToolContextModel = Joi.object().keys({
  context_id: Joi.number().required(),
  tool_id: Joi.number().required(),
  options:  Joi.object().required().keys({
    attribution: Joi.string(),
    minZoom: Joi.number(),
    maxZoom: Joi.number()
  })
});

export const updateToolContextModel = Joi.object().keys({
    context_id: Joi.number(),
    tool_id: Joi.number(),
    options:  Joi.object().required().keys({
      attribution: Joi.string(),
      minZoom: Joi.number(),
      maxZoom: Joi.number()
    })
});
