import * as Joi from 'joi';

export const createContextPermissionModel = Joi.object().keys({
  profil: Joi.string().required(),
  typePermission: Joi.string().valid('read', 'write')
});

export const updateContextPermissionModel = Joi.object().keys({
  profil: Joi.string(),
  typePermission: Joi.string().valid('read', 'write')
});
