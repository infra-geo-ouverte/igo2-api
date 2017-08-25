import * as Joi from 'joi';

import { ToolValidator } from '../tool/tool.validator';
import { LayerValidator } from '../layer/layer.validator';

const createToolModel = ToolValidator.createModel;
const updateToolModel = ToolValidator.updateModel
  .keys({id: Joi.string()});

const createLayerModel = LayerValidator.createModel
  .keys({order: Joi.number()});
const updateLayerModel = LayerValidator.updateModel
  .keys({
    id: Joi.string(),
    order: Joi.number()
  });

export class ContextValidator {

  static createModel = Joi.object().keys({
    scope: Joi.string().required().valid('public', 'protected', 'private'),
    uri: Joi.string().required(),
    title: Joi.string().required(),
    icon: Joi.string().allow(''),
    map:  Joi.object().required().keys({
      view: Joi.object().keys({
        center: Joi.array().length(2).items(Joi.number()),
        zoom: Joi.number(),
        projection: Joi.string()
      })
    }),
    layers: Joi.array().items(
      Joi.alternatives().try(createLayerModel, updateLayerModel)
    ),
    tools: Joi.array().items(
      Joi.alternatives().try(createToolModel, updateToolModel)
    )
  });

  static updateModel = Joi.object().keys({
      scope: Joi.string().valid('public', 'protected', 'private'),
      uri: Joi.string(),
      title: Joi.string(),
      icon: Joi.string().allow(''),
      map:  Joi.object().keys({
        view: Joi.object().keys({
          center: Joi.array().length(2).items(Joi.number()),
          zoom: Joi.number(),
          projection: Joi.string()
        })
      }),
      layers: Joi.array().items(
        Joi.alternatives().try(createLayerModel, updateLayerModel)
      ),
      tools: Joi.array().items(
        Joi.alternatives().try(createToolModel, updateToolModel)
      )
  });

}
