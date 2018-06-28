import * as Joi from 'joi';

export const SwaggerSchema = Joi.object().keys({
  basePath: Joi.string().optional(),
  info: Joi.object()
    .optional()
    .keys({
      title: Joi.string().optional(),
      description: Joi.string().optional(),
      version: Joi.string().optional()
    }),
  tags: Joi.array()
    .optional()
    .items(
      Joi.object().keys({
        name: Joi.string().optional(),
        description: Joi.string().optional()
      })
    ),
  documentationPath: Joi.string().optional(),
  jsonPath: Joi.string().optional(),
  lang: Joi.string().optional(),
  swaggerUIPath: Joi.string().optional()
});

export interface SwaggerTagOptions {
  name?: string;
  description?: string;
}

export interface SwaggerOptions {
  basePath?: string;
  info?: {
    title?: string;
    description?: string;
    version?: string;
  };
  tags?: SwaggerTagOptions[];
  documentationPath?: string;
  jsonPath?: string;
  lang?: string;
  swaggerUIPath?: string;
}

export const defaults: SwaggerOptions = {};
