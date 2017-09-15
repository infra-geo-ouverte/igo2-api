import * as Joi from 'joi';


export class LayerValidator {

  static createModel = Joi.object().keys({
    title: Joi.string().required().max(128),
    type: Joi.string().required().max(32),
    view:  Joi.object().keys({
      attribution: Joi.string().allow(''),
      minZoom: Joi.number(),
      maxZoom: Joi.number()
    }),
    source:  Joi.object().keys({
      url: Joi.string().allow(''),
      params: Joi.object()
    })
  });

  static updateModel = Joi.object().keys({
      title: Joi.string().max(128),
      type: Joi.string().max(32),
      view:  Joi.object().keys({
        attribution: Joi.string().allow(''),
        minZoom: Joi.number(),
        maxZoom: Joi.number()
      }),
      source:  Joi.object().keys({
        url: Joi.string().allow(''),
        params: Joi.object()
      })
  });

}
