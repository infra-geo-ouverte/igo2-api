import * as Joi from 'joi';

export class UserValidator {
  static updateModel = Joi.object().keys({
    email: Joi.string().email()
  });

  static loginModel = Joi.object()
    .keys({
      username: Joi.string().alphanum(),
      password: Joi.string().trim(),
      token: Joi.string(),
      typeConnection: Joi.string().valid('ldap', 'facebook', 'google', 'test')
    })
    .xor('username', 'token');
}
