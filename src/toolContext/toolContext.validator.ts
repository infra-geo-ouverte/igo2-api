import * as Joi from 'joi';

export class ToolContextValidator {

  static createModel = Joi.object().keys({
    toolId: Joi.number().required(),
    options:  Joi.object()
  });

  static updateModel = Joi.object().keys({
    options:  Joi.object()
  });

}
