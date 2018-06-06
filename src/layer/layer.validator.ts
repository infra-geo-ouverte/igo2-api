import * as Joi from 'joi';


export class LayerValidator {

  static createModel = Joi.object().keys({
    title: Joi.string().required().max(128),
    type: Joi.string().required().max(32),
    baseLayer: Joi.boolean(),
    view:  Joi.object().keys({
      attribution: Joi.string().allow(''),
      minZoom: Joi.number(),
      maxZoom: Joi.number()
    }),
    source:  Joi.object().keys({
      url: Joi.string().allow(''),
      params: Joi.object(),
      featureTypes: Joi.string().allow(''),
      fieldNameGeometry: Joi.string().allow(''),
      maxFeatures: Joi.number(),
      version: Joi.string().allow(''),
      outputFormat: Joi.string().allow(''),
      outputFormatDownload: Joi.string().allow('')
    }),
    isOgcFilterable: Joi.boolean(),
    ogcFilters: Joi.object().keys({
      filtersAreEditable: Joi.boolean(),
      filters: Joi.object()
    }),
    sourceFields: Joi.array().items(
      Joi.object().keys({
        name: Joi.string(),
        alias: Joi.string(),
      })
    ),
    wfsSource:  Joi.object().keys({
      url: Joi.string().allow(''),
      featureTypes: Joi.string().allow(''),
      fieldNameGeometry: Joi.string().allow(''),
      maxFeatures: Joi.number(),
      version: Joi.string().allow(''),
      outputFormat: Joi.string().allow(''),
      outputFormatDownload: Joi.string().allow('')
    }),
    download: Joi.object(),
    metadata: Joi.object(),
    timeFilter: Joi.object(),
    options: Joi.object()
  });

  static updateModel = Joi.object().keys({
      title: Joi.string().max(128),
      type: Joi.string().max(32),
      baseLayer: Joi.boolean(),
      view:  Joi.object().keys({
        attribution: Joi.string().allow(''),
        minZoom: Joi.number(),
        maxZoom: Joi.number()
      }),
      source:  Joi.object().keys({
        url: Joi.string().allow(''),
        params: Joi.object(),
        featureTypes: Joi.string().allow(''),
        fieldNameGeometry: Joi.string().allow(''),
        maxFeatures: Joi.number(),
        version: Joi.string().allow(''),
        outputFormat: Joi.string().allow(''),
        outputFormatDownload: Joi.string().allow('')
      }),
      isOgcFilterable: Joi.boolean(),
      ogcFilters: Joi.object().keys({
        filtersAreEditable: Joi.boolean(),
        filters: Joi.object()
      }),
      sourceFields: Joi.array().items(
        Joi.object().keys({
          name: Joi.string(),
          alias: Joi.string(),
        })
      ),
      wfsSource:  Joi.object().keys({
        url: Joi.string().allow(''),
        featureTypes: Joi.string().allow(''),
        fieldNameGeometry: Joi.string().allow(''),
        maxFeatures: Joi.number(),
        version: Joi.string().allow(''),
        outputFormat: Joi.string().allow(''),
        outputFormatDownload: Joi.string().allow('')
      }),
      download: Joi.object(),
      metadata: Joi.object(),
      timeFilter: Joi.object(),
      options: Joi.object()
  });

}
