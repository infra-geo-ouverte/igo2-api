import * as Joi from 'joi';
import * as Boom from 'boom';

export const updateUserModel = Joi.object().keys({
    email: Joi.string().email()
});

export const loginUserModel = Joi.object().keys({
    username: Joi.string(),
    password: Joi.string().trim(),
    token: Joi.string(),
    typeConnexion: Joi.string().valid('msp', 'facebook', 'google'),
}).xor('username', 'token');

export const userValidator = Joi.object({
  'x-consumer-id': Joi.string().required(),
  'x-consumer-username': Joi.string().required()
}).unknown();

export const authenticateValidator = (value, options, next) => {
  const schema = userValidator.concat(
    Joi.object({
      'x-anonymous-consumer': Joi.boolean().forbidden()
    }).unknown()
  );
  const valid = Joi.validate(
    value,
    schema
  );

  if (valid.error) {
    next(Boom.unauthorized('Must be authenticated'));
  } else {
    next(null, value);
  }
};
