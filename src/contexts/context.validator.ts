import * as Joi from 'joi';

import { createToolModel, updateToolModel } from '../tools/tool.validator';
import { createLayerModel, updateLayerModel } from '../layers/layer.validator';

const updateToolObjModel = updateToolModel.keys({id: Joi.string()});
const updateLayerObjModel = updateLayerModel.keys({id: Joi.string()});

export const createContextModel = Joi.object().keys({
  scope: Joi.string().required().valid('public', 'protected', 'private'),
  uri: Joi.string().required(),
  title: Joi.string().required(),
  icon: Joi.string(),
  map:  Joi.object().required().keys({
    view: Joi.object().keys({
      center: Joi.array().length(2).items(Joi.number()),
      zoom: Joi.number(),
      projection: Joi.string()
    })
  }),
  layers: Joi.array().items(
    Joi.alternatives().try(createLayerModel, updateLayerObjModel)
  ),
  tools: Joi.array().items(
    Joi.alternatives().try(createToolModel, updateToolObjModel)
  ),
  toolbar: Joi.array().items(Joi.string())
});

export const updateContextModel = Joi.object().keys({
    scope: Joi.string().valid('public', 'protected', 'private'),
    uri: Joi.string(),
    title: Joi.string(),
    icon: Joi.string(),
    map:  Joi.object().keys({
      view: Joi.object().keys({
        center: Joi.array().length(2).items(Joi.number()),
        zoom: Joi.number(),
        projection: Joi.string()
      })
    }),
    layers: Joi.array().items(
      Joi.alternatives().try(createLayerModel, updateLayerObjModel)
    ),
    tools: Joi.array().items(
      Joi.alternatives().try(createToolModel, updateToolObjModel)
    ),
    toolbar: Joi.array().items(Joi.string())
});
