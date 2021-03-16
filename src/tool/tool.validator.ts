import * as Joi from 'joi';

export class ToolValidator {
  static updateModel = Joi.object().keys({
    name: Joi.string().max(64),
    title: Joi.string()
      .allow('')
      .max(64),
    tooltip: Joi.string()
      .allow('')
      .max(128),
    icon: Joi.string()
      .allow('')
      .max(128),
    inToolbar: Joi.boolean(),
    global: Joi.boolean(),
    order: Joi.number(),
    options: Joi.object(),
    profils: Joi.array().items(Joi.string().max(128))
  });

  static createModel = ToolValidator.updateModel.concat(
    Joi.object().keys({
      name: Joi.required()
    })
  );
}
