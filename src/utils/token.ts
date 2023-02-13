import * as Hapi from '@hapi/hapi';
import * as Jwt from 'jsonwebtoken';
import { Config } from '@igo2/base-api';
import { IgoJWTUser } from '../login/login.interface';
import { IUser } from '../user/user.interface';
import * as Boom from '@hapi/boom';
import { JwtConfig } from '../configurations';

export function verifyTokenAndDecode (jwtToken): any {
  const jwtConfig = Config.getConfig('jwt') as JwtConfig;
  if (!jwtToken || !jwtConfig) {
    return;
  }
  try {
    return Jwt.verify(jwtToken, jwtConfig.secretKey,jwtConfig.verifyOptions);
  } catch (err) {
    throw Boom.forbidden(err);
  }
}

export function HapiRequestToUser (request: Hapi.Request): IUser {
  if (!request.headers) {
    return;
  }
  const authorizationHeader = request.headers.authorization;
  if (!request.headers.authorization) {
    return;
  }
  const jwtToken = authorizationHeader.split(' ')[1];
  return TokenToUser(jwtToken);
}

export function TokenToUser (jwtToken: string): IUser {
  const decodedToken = verifyTokenAndDecode(jwtToken) as IgoJWTUser;
  if (decodedToken) {
    return decodedToken.user;
  }
}
