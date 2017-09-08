import * as Joi from 'joi';

export class LayerContextValidator {

  static createModel = Joi.object().keys({
    layerId: Joi.number().required(),
    view: Joi.object().keys({
      attribution: Joi.string().allow(''),
      minZoom: Joi.number(),
      maxZoom: Joi.number()
    }),
    options: Joi.object().keys({
      visible: Joi.boolean(),
      title: Joi.string()
    }),
    order: Joi.number()
  });

  static updateModel = Joi.object().keys({
    view: Joi.object().keys({
      attribution: Joi.string().allow(''),
      minZoom: Joi.number(),
      maxZoom: Joi.number()
    }),
    options: Joi.object().keys({
      visible: Joi.boolean(),
      title: Joi.string()
    }),
    order: Joi.number()
  });

}
