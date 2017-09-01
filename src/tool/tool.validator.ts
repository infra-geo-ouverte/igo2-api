import * as Joi from 'joi';

export class ToolValidator {
  static createModel = Joi.object().keys({
    name: Joi.string().required().max(64),
    title: Joi.string().allow('').max(64),
    tooltip: Joi.string().allow('').max(128),
    icon: Joi.string().allow('').max(128),
    inToolbar: Joi.boolean(),
    options:  Joi.object()
  });

  static updateModel = Joi.object().keys({
      name: Joi.string().max(64),
      title: Joi.string().allow('').max(64),
      tooltip: Joi.string().allow('').max(128),
      icon: Joi.string().allow('').max(128),
      inToolbar: Joi.boolean(),
      options:  Joi.object()
  });
}
