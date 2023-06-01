import { IgoJWTUser, UserWithCredentials } from './login.interface';
import { ActiveDirectory } from 'activedirectory';
import { Base64, Config } from '@igo2/base-api';
import * as Hapi from '@hapi/hapi';
import * as Boom from '@hapi/boom';
import * as Jwt from 'jsonwebtoken';
import { IUser } from '../user/user.interface';
import { User } from '../user/user.model';
import { IUserIgo, UserIgo, UserIgoService } from '../userIgo';
import { UserService } from '../user/user.service';
import { CredentialsConfig, JwtConfig } from '../configurations';
import { verifyTokenAndDecode } from '../utils';

export class LoginService {
  public async authenticateByIgoUsers (
    userCredentials: UserWithCredentials)
    : Promise<any> {
    const jwtConfig = Config.getConfig('jwt') as JwtConfig;
    const credentialsConfig = Config.getConfig('credentials') as CredentialsConfig;

    const usersFromCredentialsConfig :UserWithCredentials[] = [];
    const adminUsernames = [];
    if (credentialsConfig.admins) {
      credentialsConfig.admins.map((admin: UserWithCredentials) => usersFromCredentialsConfig.push(admin));
      credentialsConfig.admins.map((admin: UserWithCredentials) => adminUsernames.push(admin.username));
    }
    if (credentialsConfig.users) {
      credentialsConfig.users.map(user => usersFromCredentialsConfig.push(user));
    }

    const currentUserFromConfig: UserWithCredentials = usersFromCredentialsConfig
      .find(ufc => ufc.username.toLowerCase() === userCredentials.username.toLowerCase());
    return new Promise((resolve, reject) => {
      let userInfoPayload: IgoJWTUser;
      if (
        currentUserFromConfig &&
        Base64.decode(userCredentials.password) === currentUserFromConfig.password
      ) {
        userInfoPayload = {
          user: {
            id: currentUserFromConfig.username,
            source: 'igo',
            sourceId: currentUserFromConfig.username,
            firstName: currentUserFromConfig.firstName,
            lastName: currentUserFromConfig.lastName,
            email: currentUserFromConfig.email,
            isAdmin: adminUsernames.includes(userCredentials.username)
          }
        };
        const token = Jwt.sign(
          userInfoPayload,
          jwtConfig.secretKey,
          Object.assign(
            {},
            jwtConfig.signOptions,
            { expiresIn: currentUserFromConfig.expiresIn || jwtConfig.signOptions.expiresIn || '1d' })
        );
        this.updateOrCreateUser(userInfoPayload.user);
        this.createUserIgoIfNotExists(userInfoPayload.user, currentUserFromConfig.profils);
        resolve({ token });
      } else {
        reject(Boom.unauthorized('Invalid username or password'));
      }
    });
  }

  public async authenticateByAd (
    ad: ActiveDirectory,
    userCredentials: UserWithCredentials)
    : Promise<any> {
    const jwtConfig = Config.getConfig('jwt') as JwtConfig;
    return new Promise((resolve, reject) => {
      let userInfoPayload: IgoJWTUser;
      ad.findUser(userCredentials.username, async (err, user) => {
        if (err) {
          reject(Boom.unauthorized('Error with this username'));
        }
        if (!user) {
          reject(Boom.notFound('User: ' + userCredentials.username + ' not found.'));
        } else {
          userInfoPayload = {
            user: {
              id: user.objectGUID,
              source: 'ldap',
              sourceId: user.sAMAccountName,
              firstName: user.givenName,
              lastName: user.sn,
              email: user.mail
            }
          } as IgoJWTUser;
          return ad.authenticate(userInfoPayload.user.email, Base64.decode(userCredentials.password), async (err, auth) => {
            if (err) {
              reject(Boom.unauthorized('Invalid username or password'));
            }

            if (auth) {
              const token = Jwt.sign(
                userInfoPayload,
                jwtConfig.secretKey,
                Object.assign({}, jwtConfig.signOptions, { expiresIn: jwtConfig.signOptions.expiresIn || '1d' })
              );
              this.updateOrCreateUser(userInfoPayload.user);
              this.createUserIgoIfNotExists(userInfoPayload.user);
              resolve({ token });
            } else {
              reject(Boom.unauthorized('Authentication failed'));
            }
          });
        };
      });
    });
  }

  public async refreshToken (request: Hapi.Request): Promise<{ token: string }> {
    const authorizationHeader = request.headers.authorization;
    const jwtConfig = Config.getConfig('jwt') as JwtConfig;
    if (!authorizationHeader) {
      throw Boom.forbidden();
    }
    const jwtToken = authorizationHeader.split(' ')[1];
    const tokenDecoded: any = verifyTokenAndDecode(jwtToken);
    const user = tokenDecoded.user;
    user.refresh = user.refresh ? ++user.refresh : 1;
    const jwtMaxRefresh = jwtConfig.maxRefresh || 0;
    if (!jwtMaxRefresh || user.refresh > jwtMaxRefresh) {
      throw Boom.unauthorized('Maximum of refreshments reached');
    }

    try {
      Jwt.verify(jwtToken, jwtConfig.secretKey, jwtConfig.verifyOptions);
    } catch (err) {
      throw Boom.forbidden();
    }

    return {
      token: Jwt.sign(
        { user },
        jwtConfig.secretKey,
        Object.assign({}, jwtConfig.signOptions, { expiresIn: jwtConfig.signOptions.expiresIn || '1d' })
      )
    };
  }

  private async createUserIgoIfNotExists (
    userInfo: IUser,
    profils?: []
  ): Promise<UserIgo> {
    const userIgoService = new UserIgoService();
    const userIgoInfo: IUserIgo = { userId: userInfo.id };
    if (profils) {
      userIgoInfo.profils = profils as any;
    }
    const userIgo = await userIgoService.get(userIgoInfo.userId).catch(error => {
      if (error.output.statusCode === 404) {
        return undefined;
      }
      throw error;
    });
    if (!userIgo) {
      return await userIgoService.create(userIgoInfo);
    }
    return Object.assign(userIgo, userIgoInfo);
  }

  private async updateOrCreateUser (
    userInfo: IUser
  ): Promise<User> {
    const userService = new UserService();
    const user = await userService.getUserBySource(userInfo.sourceId, userInfo.source).catch(error => {
      if (error.output.statusCode === 404) {
        return undefined;
      }
      throw error;
    });
    if (!user) {
      return await userService.create(userInfo);
    }
    userService.update(user.id.toString(), userInfo);
    return Object.assign(user, userInfo);
  }
}
