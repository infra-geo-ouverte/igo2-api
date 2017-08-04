import * as Hapi from 'hapi';
import * as Boom from 'boom';
import * as Jwt from 'jsonwebtoken';
import * as ldap from 'ldapjs';
import * as Rx from 'rxjs';
import * as https from 'https';
import * as http from 'http';
import * as querystring from 'querystring';
import { IUser, UserInstance } from './user.model';
import { User } from './user';
import { IDatabase } from '../database';
import { IServerConfiguration } from '../configurations';
import { Base64, ObjectUtils } from '../utils';

export default class UserController {

  private database: IDatabase;
  private configs: IServerConfiguration;

  constructor(configs: IServerConfiguration, database: IDatabase) {
    this.database = database;
    this.configs = configs;
  }

  public loginUser(request: Hapi.Request, reply: Hapi.IReply) {
    const typeConnexion = request.payload.typeConnexion || 'msp';
    if (typeConnexion === 'msp') {
      this.loginMspUser(request, reply);
    } else {
      this.loginSocialUser(request, reply);
    }
  }

  public updateUser(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.headers['x-consumer-custom-id'];
    const user: IUser = request.payload;

    this.database.user.update(user, {
      where: {
        id: id
      }
    }).then((count: [number, UserInstance[]]) => {
      if (count[0]) {
        reply({ id: id });
      } else {
        reply(Boom.notFound());
      }
    }).catch((error) => {
      reply(Boom.badImplementation(error));
    });
  }

  public deleteUser(request: Hapi.Request, reply: Hapi.IReply) {
    const customId = request.headers['x-consumer-custom-id'];
    const id = request.headers['x-consumer-id'];

    this.database.user.destroy({
      where: {
        id: customId
      }
    }).then((count: number) => {
      if (count) {
        this.deleteUserKong(id).subscribe(() => {
          reply({}).code(204);
        });
      } else {
        reply(Boom.notFound());
      }
    }).catch((error) => {
      reply(Boom.badImplementation(error));
    });
  }

  public infoUser(request: Hapi.Request, reply: Hapi.IReply) {
    const customId = request.headers['x-consumer-custom-id'];

    this.database.user.findOne({
      where: {
        id: customId
      }
    }).then((user: UserInstance) => {
      if (user) {
        reply(ObjectUtils.removeNull(user.get()));
      } else {
        reply(Boom.notFound());
      }
    }).catch((error) => {
      reply(Boom.badImplementation(error));
    });
  }

  public getProfilsReq(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.headers['x-consumer-id'];
    if (!id) {
      reply(Boom.notFound());
    }
    User.getProfils(id).subscribe((profils) => {
      if (!profils) {
        reply(Boom.notFound());
      } else {
        reply({ profils: profils });
      }
    });
  }

  private getUserBySource(sourceId: string, sources: string | string[]) {
    if (sources === 'facebook' || sources === 'google') {
      sources = ['facebook', 'google'];
    }
    return this.database.user.findOne({
      where: {
        sourceId: sourceId,
        source: sources
      }
    });
  }

  private createUserBySource(user: IUser) {
    return this.database.user.create(user);
  }

  private getOrCreateUser(sourceId: string, source: string) {
    return Rx.Observable.create(observer => {
      this.getUserBySource(sourceId, source).then((user: UserInstance) => {
        if (user) {
          observer.next(user);
          observer.complete();
        } else {
          this.createUserBySource({
            sourceId: sourceId,
            source: source
          }).then((userCreated: UserInstance) => {
            observer.next(userCreated);
            observer.complete();
          });
        }
      });
    });
  }

  private createUserKong(user: UserInstance) {
    return Rx.Observable.create(observer => {
      const userKongToCreate = querystring.stringify({
        username: user.sourceId,
        custom_id: user.id
      });
      const options = {
        host: this.configs.userApi.host,
        port: this.configs.userApi.port,
        path: `/consumers`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(userKongToCreate)
        }
      };

      const callback = (res) => {
        res.setEncoding('utf8');
        res.on('data', function(d) {
          const data = JSON.parse(d);
          observer.next(data);
          observer.complete();
        });
      };

      const req = http.request(options, callback);
      req.write(userKongToCreate);
      req.end();
    });
  }

  private deleteUserKong(id: string) {
    return Rx.Observable.create(observer => {
      const options = {
        host: this.configs.userApi.host,
        port: this.configs.userApi.port,
        path: `/consumers/${id}`,
        method: 'DELETE'
      };

      const callback = (res) => {
        res.on('readable', () => {});
        res.on('end', () => {
          observer.next();
          observer.complete();
        });
      };

      const req = http.request(options, callback);
      req.end();

    });
  }

  private getUserKong(user: UserInstance) {
    return Rx.Observable.create(observer => {
      const options = {
        host: this.configs.userApi.host,
        port: this.configs.userApi.port,
        path: `/consumers/${user.sourceId}`,
        method: 'GET'
      };

      const callback = (res) => {
        res.setEncoding('utf8');
        res.on('data', function(d) {
          const data = JSON.parse(d);
          observer.next(data);
          observer.complete();
        });
      };

      const req = http.request(options, callback);
      req.end();
    });
  }

  private getOrCreateUserKong(user: UserInstance) {
    return Rx.Observable.create(observer => {
      this.getUserKong(user).subscribe((userKong) => {
        if (!userKong.username) {
          this.createUserKong(user).subscribe((userKongCreated) => {
            observer.next(userKongCreated);
            observer.complete();
          });
        } else {
          observer.next(userKong);
          observer.complete();
        }
      });
    });
  }

  private createAccessTokenUserKong(userKong) {
    return Rx.Observable.create(observer => {
      const options = {
        host: this.configs.userApi.host,
        port: this.configs.userApi.port,
        path: `/consumers/${userKong.id}/jwt`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };

      const callback = (res) => {
        res.setEncoding('utf8');
        res.on('data', function(d) {
          const data = JSON.parse(d);
          observer.next(data);
          observer.complete();
        });
      };

      const req = http.request(options, callback);
      req.end();
    });
  }

  private getAccessTokenUserKong(userKong) {
    return Rx.Observable.create(observer => {
      const options = {
        host: this.configs.userApi.host,
        port: this.configs.userApi.port,
        path: `/consumers/${userKong.id}/jwt`,
        method: 'GET'
      };

      const callback = (res) => {
        res.setEncoding('utf8');
        res.on('data', (d) => {
          const data = JSON.parse(d);
          if (data.total) {
            observer.next(data);
            observer.complete();
          } else {
            this.createAccessTokenUserKong(userKong).subscribe((tokenKong) => {
              observer.next({ data: [tokenKong] });
              observer.complete();
            });
          }
        });
      };

      const req = http.request(options, callback);
      req.end();
    });
  }

  private deleteGroupUserKong(userKong, groupKong) {
    const options = {
      host: this.configs.userApi.host,
      port: this.configs.userApi.port,
      path: `/consumers/${userKong.id}/acls/${groupKong.id}`,
      method: 'DELETE'
    };

    const callback = (res) => {
      res.setEncoding('utf8');
      res.on('data', (d) => {

      });
    };

    const req = http.request(options, callback);
    req.end();
  }

  private createGroupUserKong(userKong, groupKong) {
    const aclToCreate = querystring.stringify({
      group: groupKong
    });

    const options = {
      host: this.configs.userApi.host,
      port: this.configs.userApi.port,
      path: `/consumers/${userKong.id}/acls`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(aclToCreate)
      }
    };

    const callback = (res) => {
      res.setEncoding('utf8');
      res.on('data', (d) => {

      });
    };

    const req = http.request(options, callback);
    req.write(aclToCreate);
    req.end();
  }

  private updateGroupsUserKong(user: UserInstance, groups: string[], userKong) {
    return Rx.Observable.create(observer => {
      if (user.source !== 'msp') {
        observer.next();
        observer.complete();
        return;
      }
      const options = {
        host: this.configs.userApi.host,
        port: this.configs.userApi.port,
        path: `/consumers/${userKong.id}/acls`,
        method: 'GET'
      };

      const callback = (res) => {
        res.setEncoding('utf8');
        res.on('data', (d) => {
          const data = JSON.parse(d);
          for (const acl of data.data) {
            if (acl.group.substring(0, 5) !== 'GRAPP') {
              continue;
            }
            const gFound = groups.find((g) => g === acl.group);
            if (!gFound) {
              this.deleteGroupUserKong(userKong, acl);
            }
          }

          for (const g of groups) {
            const aclFound = data.data.find((acl) => g === acl.group);
            if (!aclFound) {
              this.createGroupUserKong(userKong, g);
            }
          }


          observer.next();
          observer.complete();
        });
      };

      const req = http.request(options, callback);
      req.end();
    });
  }

  private generateToken(user: UserInstance, groups?: string[]) {
    return Rx.Observable.create(observer => {
      const jwtExpiration = this.configs.jwtExpiration;

      this.getOrCreateUserKong(user).subscribe((userKong) => {
        this.updateGroupsUserKong(user, groups, userKong).subscribe(() => {
          this.getAccessTokenUserKong(userKong).subscribe((tokenKong) => {
            const jwtSecret = tokenKong.data[0].secret;
            const iss = tokenKong.data[0].key;
            const jwt = Jwt.sign(
              {
                user: user,
                iss: iss
              },
              jwtSecret,
              { expiresIn: jwtExpiration }
            );
            observer.next(jwt);
            observer.complete();
          });
        });
      });
    });
  }

  private validatePassword(username: string, password: string) {
    return Rx.Observable.create(observer => {
      if (!username) {
        observer.error(new Error('Username empty'));
      }
      const client = ldap.createClient({
        url: 'ldap://ldap.sso.msp.gouv.qc.ca'
      });

      const opts = {
        filter: `(&(objectclass=person)(cn=${username}))`,
        scope: 'sub',
        attributes: ['dn', 'mail', 'sn', 'cn',
          'givenName', 'fullName', 'Language',
          'passwordExpirationTime', 'groupMembership'],
        sizeLimit: 1
      };

      let ldapres;
      const baseSearch = 'ou=DTIA,ou=DGSG,ou=SSO,o=msp';
      client.search(baseSearch, opts, function(errSearch, search) {
        search.on('searchEntry', function(entry) {
          ldapres = entry.object;
        });

        search.on('end', function(result) {
          if (ldapres) {
            client.bind(ldapres.dn, Base64.decode(password), function(errBind) {
              if (errBind) {
                // TODO : gérer les mdp expirés.
                observer.error(new Error('Wrong password'));
              } else {
                observer.next(ldapres);
                observer.complete();
              }
            });
          } else {
            observer.error(new Error('Invalid username'));
          }
        });
      });
    });
  }

  private loginMspUser(request: Hapi.Request, reply: Hapi.IReply) {
    const username = request.payload.username;
    const password = request.payload.password;

    this.validatePassword(username, password).subscribe(
      userInfo => {
        this.getOrCreateUser(username, 'msp').subscribe(
          user => {
            user.email = userInfo.mail;
            const groups = [];
            for (const g of userInfo.groupMembership) {
              if (g.search('ou=APP,ou=SSO,o=MSP') !== -1) {
                const gName = g.substring(g.indexOf('cn=') + 3, g.indexOf(','));
                groups.push(gName);
              }
            }
            this.generateToken(user, groups).subscribe(
              token => {
                reply({
                  token: token
                });
              }
            );
          }
        );
      },
      error => {
        reply(Boom.unauthorized('Incorrect username and/or password'));
      }
    );
  }

  private validateSocialToken(token: string, typeConnexion: string) {
    if (typeConnexion === 'facebook') {
      return this.validateFacebookToken(token);
    } else if (typeConnexion === 'google') {
      return this.validateGoogleToken(token);
    }
  }

  private validateFacebookToken(token: string) {
    return Rx.Observable.create(observer => {

      const fields = 'name,email,gender,first_name,last_name,picture,locale';
      const options = {
        host: 'graph.facebook.com',
        path: `/me?fields=${fields}&access_token=${token}`,
        method: 'GET'
      };

      const callback = (res) => {
        res.setEncoding('utf8');
        res.on('data', function(d) {
          const data = JSON.parse(d);
          if (data && !data.error) {
            observer.next(data);
          } else {
            observer.error(new Error('Invalid token'));
          }
          observer.complete();
        });
      };

      const req = https.request(options, callback);
      req.end();
    });
  }

  private validateGoogleToken(token: string) {
    return Rx.Observable.create(observer => {

      const key = this.configs.googleKey;
      const fields = 'person.names,person.locales,person.emailAddresses';

      const options = {
        host: 'content-people.googleapis.com',
        path: `/v1/people/me?requestMask.includeField=${fields}&key=${key}`,
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      };

      const callback = (res) => {
        res.setEncoding('utf8');
        res.on('data', function(d) {
          const data = JSON.parse(d);
          if (data && !data.error) {
            const userInfo = {
              email: data.emailAddresses[0].value,
              id: data.names[0].metadata.source.id
            };
            observer.next(userInfo);
          } else {
            observer.error(new Error('Invalid token'));
          }
          observer.complete();
        });
      };

      const req = https.request(options, callback);
      req.end();
    });
  }

  private loginSocialUser(request: Hapi.Request, reply: Hapi.IReply) {
    const socialToken = request.payload.token;
    const typeConnexion = request.payload.typeConnexion;

    this.validateSocialToken(socialToken, typeConnexion).subscribe(
      userInfo => {
        this.getOrCreateUser(userInfo.email, typeConnexion).subscribe(
          user => {
            this.generateToken(user).subscribe(
              token => {
                reply({
                  token: token
                });
              }
            );
          }
        );
      },
      error => {
        reply(Boom.unauthorized(`Incorrect token from ${typeConnexion}`));
      }
    );
  }
}
