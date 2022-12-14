import * as Joi from 'joi';

import { JoiPlus } from '@igo2/base-api';
import { ToolValidator } from '../tool/tool.validator';
import { LayerValidator } from '../layer/layer.validator';

const createToolModel = ToolValidator.createModel;
const updateToolModel = ToolValidator.updateModel.keys({ id: Joi.string() });

const createLayerModel = LayerValidator.layerOptionsModel.keys({
  sourceOptions: LayerValidator.sourceOptionsModel,
  layerOptions: LayerValidator.layerOptionsModel
});

const updateLayerModel = createLayerModel.keys({
  id: Joi.string()
});

export class ContextValidator {
  static updateModel = Joi.object().keys({
    scope: Joi.string().valid('public', 'protected', 'private'),
    uri: Joi.string().max(128),
    title: Joi.string().max(128),
    icon: Joi.string().allow(''),
    map: Joi.object().keys({
      view: Joi.object().keys({
        center: Joi.array()
          .length(2)
          .items(Joi.number()),
        zoom: Joi.number(),
        projection: Joi.string(),
        maxZoomOnExtent: Joi.number()
      })
    }),
    layers: Joi.array().items(Joi.alternatives().try(createLayerModel, updateLayerModel)),
    tools: Joi.array().items(Joi.alternatives().try(createToolModel, updateToolModel))
  });

  static createModel = ContextValidator.updateModel.concat(
    Joi.object().keys({
      scope: Joi.required(),
      uri: Joi.required(),
      title: Joi.required(),
      map: Joi.required()
    })
  );

  static getQuery = {
    permission: JoiPlus.stringArray().items(Joi.string().regex(/^[\wÀ-ÿ\-\_']+$/, 'Alphanum latin')),
    hidden: Joi.boolean()
  };
}
