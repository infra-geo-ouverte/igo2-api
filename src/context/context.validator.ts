import * as Joi from 'joi';

import { ToolValidator } from '../tool/tool.validator';
import { LayerValidator } from '../layer/layer.validator';

const JoiPlus = Joi.extend((joi: Joi.Root) => ({
  base: joi.array(),
  name: 'stringArray',
  coerce: (value: any, _state: Joi.State, _options: Joi.ObjectSchema) => {
    if (typeof value !== 'string') {
      return value;
    }
    const delimiter = value.search(';') === -1 ? ',' : ';';
    return value.split(delimiter).map(r => r.trim());
  }
}));

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
    uri: Joi.string().max(64),
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
