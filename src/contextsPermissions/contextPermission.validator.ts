import * as Joi from 'joi';

export const createContextPermissionModel = Joi.object().keys({
  context_id: Joi.number().required(),
  profil: Joi.string().required(),
  typePermission: Joi.string().valid('read', 'write')
});

export const updateContextPermissionModel = Joi.object().keys({
  context_id: Joi.number(),
  profil: Joi.string(),
  typePermission: Joi.string().valid('read', 'write')
});
