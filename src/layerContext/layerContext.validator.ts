import * as Joi from 'joi';
import { LayerValidator } from '../layer/layer.validator';

export class LayerContextValidator {
  static createModel = Joi.object().keys({
    layerId: Joi.number().required(),
    layerOptions: LayerValidator.layerOptionsModel,
    sourceOptions: LayerValidator.sourceOptionsModel,
    enabled: Joi.boolean().optional()
  });

  static updateModel = Joi.object().keys({
    layerOptions: LayerValidator.layerOptionsModel,
    sourceOptions: LayerValidator.sourceOptionsModel,
    enabled: Joi.boolean().optional()
  });
}
