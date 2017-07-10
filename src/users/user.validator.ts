import * as Joi from 'joi';

export const createUserModel = Joi.object().keys({
    sourceId: Joi.string().trim().required(),
    source: Joi.string().trim().required()
});

export const updateUserModel = Joi.object().keys({
    sourceId: Joi.string().trim(),
    source: Joi.string().trim()
});

export const loginUserModel = Joi.object().keys({
    username: Joi.string(),
    password: Joi.string().trim(),
    token: Joi.string(),
    typeConnexion: Joi.string().valid('msp', 'facebook', 'google'),
}).xor('username', 'token');

export const jwtValidator = Joi.object({
  'authorization': Joi.string().required()
}).unknown();

export const kongValidator = Joi.object({
  'x-consumer-custom-id': Joi.string().required()
}).unknown();
