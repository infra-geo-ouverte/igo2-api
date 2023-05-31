import * as Boom from '@hapi/boom';
import * as Hapi from '@hapi/hapi';

import { handleError, objectGUIDToUUID } from '../utils';
import { UserWithCredentials } from './login.interface';

import { LoginService } from './login.service';
import { Config } from '@igo2/base-api';
import { CredentialsConfig, ILdapConfiguration } from '../configurations';

/**
 * from https://github.com/ldapjs/node-ldapjs/issues/481
 * @param objectGUID
 * @returns
 */

export class LoginController {
  private loginService: LoginService;
  private ad;

  constructor () {
    this.loginService = new LoginService();
    const ldapConfig = Config.getConfig('ldap') as ILdapConfiguration;
    const objectGUIDParser = function customEntryParser (entry, raw, callback) {
      if (Object.prototype.hasOwnProperty.call(raw, 'objectGUID')) {
        entry.objectGUID = objectGUIDToUUID(raw.objectGUID);
      }
      callback(entry);
    };

    if (ldapConfig) {
      ldapConfig.entryParser = objectGUIDParser;
      const ActiveDirectory = require('activedirectory');
      this.ad = new ActiveDirectory(ldapConfig);
    }
  }

  public async authenticate (request: Hapi.Request, _h: Hapi.ResponseToolkit): Promise<any> {
    const credentialsConfig = Config.getConfig('credentials') as CredentialsConfig;
    const pl = request.payload as UserWithCredentials;

    const usersFromCredentialsConfig: UserWithCredentials[] = [];
    if (credentialsConfig?.admins) {
      credentialsConfig.admins.map((admin: UserWithCredentials) => usersFromCredentialsConfig.push(admin));
    }
    if (credentialsConfig?.users) {
      credentialsConfig.users.map(user => usersFromCredentialsConfig.push(user));
    }

    const userFromIgoConfig: UserWithCredentials = usersFromCredentialsConfig.find(ufc => ufc.username.toLowerCase() === pl.username.toLowerCase());

    if (userFromIgoConfig) {
      return await this.loginService.authenticateByIgoUsers(request.payload as UserWithCredentials).catch(handleError);
    } else if (this.ad) {
      return await this.loginService.authenticateByAd(this.ad, request.payload as UserWithCredentials).catch(handleError);
    } else {
      return Promise.reject(Boom.unauthorized('Invalid username or password'))
    }
  }

  public async refreshToken (request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    return await this.loginService.refreshToken(request).catch(handleError);
  }
}
