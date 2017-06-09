import * as Joi from 'joi';

export const createToolModel = Joi.object().keys({
  name: Joi.string().required().max(64),
  title: Joi.string().required().max(64),
  icon: Joi.string().max(128),
  url: Joi.string(),
  protected: Joi.boolean(),
  inToolbar: Joi.boolean(),
  options:  Joi.object().required()
});

export const updateToolModel = Joi.object().keys({
    name: Joi.string().max(64),
    title: Joi.string().max(64),
    icon: Joi.string().max(128),
    url: Joi.string(),
    protected: Joi.boolean(),
    inToolbar: Joi.boolean(),
    options:  Joi.object().required()
});
