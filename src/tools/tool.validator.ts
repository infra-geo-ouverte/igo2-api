import * as Joi from 'joi';

export const createToolModel = Joi.object().keys({
  name: Joi.string().required().max(64),
  title: Joi.string().allow('').max(64),
  icon: Joi.string().allow('').max(128),
  url: Joi.string().allow(''),
  protected: Joi.boolean(),
  inToolbar: Joi.boolean(),
  options:  Joi.object()
});

export const updateToolModel = Joi.object().keys({
    name: Joi.string().max(64),
    title: Joi.string().allow('').max(64),
    icon: Joi.string().allow('').max(128),
    url: Joi.string().allow(''),
    protected: Joi.boolean(),
    inToolbar: Joi.boolean(),
    options:  Joi.object()
});
