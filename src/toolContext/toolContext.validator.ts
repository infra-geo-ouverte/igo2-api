import * as Joi from 'joi';

export class ToolContextValidator {
  static updateModel = Joi.object().keys({
    enabled: Joi.boolean(),
    order: Joi.number(),
    options: Joi.object()
  });

  static createModel = ToolContextValidator.updateModel.keys({
    toolId: Joi.number().required(),
    global: Joi.boolean()
  });
}
