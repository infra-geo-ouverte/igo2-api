import * as Rx from 'rxjs';
import * as Boom from 'boom';
import * as Jwt from 'jsonwebtoken';
import * as ldap from 'ldapjs';
import * as https from 'https';
import * as http from 'http';
import * as querystring from 'querystring';

import { Base64, ObjectUtils } from '../utils';
import * as Configs from '../configurations';
import { IDatabase, database } from '../database';

import { IUser, UserInstance } from './user.model';

const ServerConfigs: Configs.IServerConfiguration = Configs.getServerConfig();

export class User {

  private database: IDatabase = database;

  static getProfils(id: string) {
    return Rx.Observable.create(observer => {
      if (!id) {
        observer.next([]);
        observer.complete();
        return;
      }

      const options = {
        host: ServerConfigs.userApi.host,
        port: ServerConfigs.userApi.port,
        path: `/consumers/${id}/acls`,
        method: 'GET'
      };

      const callback = (res) => {
        res.setEncoding('utf8')  ;
        res.on('data', (d) => {
          const data = JSON.parse(d);
          if (!data.data) {
            const message = `User '${id}' can not be found.`;
            observer.error(Boom.badRequest(message));
            return;
          }

          const profils = [];

          for (const p of data.data) {
            profils.push(p.group);
          }

          observer.next(profils);
          observer.complete();
        });
      };

      const req = http.request(options, callback);
      req.end();
    });
  }

  public loginTestUser(username: string,
    password: string): Rx.Observable<UserInstance> {

    return Rx.Observable.create(observer => {
      if (username !== 'test' || password !== 'testIgo2Password') {
        const message = 'Incorrect username and/or password';
        observer.error(Boom.unauthorized(message));
        return;
      }
      this.getOrCreateUser(username, 'test').subscribe(
        user => {
          user.email = 'test@test.com';
          this.generateToken(user).subscribe(
            token => {
              observer.next({
                token: token
              });
              observer.complete();
            }
          );
        }
      );
    });
  }

  public loginLdapUser(username: string,
    password: string): Rx.Observable<UserInstance> {

    username = username.toLowerCase();
    return Rx.Observable.create(observer => {
      this.validateUserLdap(username, password).subscribe(
        userInfo => {
          this.getOrCreateUser(username, 'ldap').subscribe(
            user => {
              user.email = userInfo.mail;
              const groups = [];

              for (const g of userInfo.groupMembership) {
                // TODO: improve GRAPP research
                const baseSearch = 'ou=APP,';
                if (g.search(baseSearch) !== -1) {
                  const iStart = g.indexOf('cn=') + 3;
                  const iEnd = g.indexOf(',');
                  const gName = g.substring(iStart, iEnd);
                  groups.push(gName);
                }
              }

              this.generateToken(user, groups).subscribe(
                token => {
                  observer.next({
                    token: token
                  });
                  observer.complete();
                }
              );
            }
          );
        },
        error => {
          observer.error(error);
        }
      );
    });
  }

  public loginSocialUser(socialToken: string,
    typeConnection: string): Rx.Observable<UserInstance> {

    return Rx.Observable.create(observer => {
      this.validateSocialToken(socialToken, typeConnection).subscribe(
        userInfo => {
          this.getOrCreateUser(userInfo.email, typeConnection).subscribe(
            user => {
              this.generateToken(user).subscribe(
                token => {
                  observer.next({
                    token: token
                  });
                  observer.complete();
                }
              );
            }
          );
        },
        error => {
          const message = `Incorrect token from ${typeConnection}`;
          observer.error(Boom.unauthorized(message));
        }
      );
    });
  }

  public update(id: string, user: IUser): Rx.Observable<UserInstance> {
    return Rx.Observable.create(observer => {
      this.database.user.update(user, {
        where: {
          id: id
        }
      }).then((count: [number, UserInstance[]]) => {
        if (count[0]) {
          observer.next({id: id});
          observer.complete();
        } else {
          observer.error(Boom.notFound());
        }
      }).catch((error) => {
        observer.error(Boom.badImplementation(error));
      });
    });
  }

  public delete(id: string, kongId: string): Rx.Observable<{}> {
    return Rx.Observable.create(observer => {
      this.database.user.destroy({
        where: {
          id: id
        }
      }).then((count: number) => {
        if (count) {
          this.deleteUserKong(kongId).subscribe(() => {
            observer.next({});
            observer.complete();
          });
        } else {
          observer.error(Boom.notFound());
        }
      }).catch((error) => {
        observer.error(Boom.badImplementation(error));
      });
    });
  }

  public get(id: string): Rx.Observable<UserInstance[]> {
    return Rx.Observable.create(observer => {
      this.database.user.findAll({
        where: {
          source: 'ldap',
          id: {
            $ne: id
          }
        }
      }).then((users: UserInstance[]) => {
        const plainUsers = users.map(
          (instance) => {
            const user = instance.get();
            return {
              sourceId: user.sourceId
            };
          }
        );
        observer.next(ObjectUtils.removeNull(plainUsers));
        observer.complete();
      }).catch((error) => {
        observer.error(Boom.badImplementation(error));
      });
    });
  }

  public info(id: string): Rx.Observable<UserInstance> {
    return Rx.Observable.create(observer => {
      this.database.user.findOne({
        where: {
          id: id
        }
      }).then((user: UserInstance) => {
        if (user) {
          observer.next(ObjectUtils.removeNull(user.get()));
          observer.complete();
        } else {
          observer.error(Boom.notFound());
        }
      }).catch((error) => {
        observer.error(Boom.badImplementation(error));
      });
    });
  }

  private getUserBySource(sourceId: string, sources: string | string[]) {
    if (sources === 'facebook' || sources === 'google') {
      sources = ['facebook', 'google'];
    }
    return Rx.Observable.create(observer => {
      this.database.user.findOne({
        where: {
          sourceId: sourceId,
          source: sources
        }
      }).then((user: UserInstance) => {
        if (user) {
          observer.next(ObjectUtils.removeNull(user.get()));
          observer.complete();
        } else {
          observer.error(Boom.notFound());
        }
      }).catch((error) => {
        observer.error(Boom.badImplementation(error));
      });
    });
  }

  private createUserBySource(user: IUser) {
    return Rx.Observable.create(observer => {
      this.database.user.create(user).then((userCreated: UserInstance) => {
        observer.next(ObjectUtils.removeNull(userCreated.get()));
        observer.complete();
      }).catch((error) => {
        observer.error(Boom.badImplementation(error));
      });
    });
  }

  private getOrCreateUser(sourceId: string, source: string) {
    return Rx.Observable.create(observer => {
      this.getUserBySource(sourceId, source).subscribe(
        (user: UserInstance) => {
          observer.next(user);
          observer.complete();
        },
        (error) => {
          if (error.output.statusCode === 404) {
            this.createUserBySource({
              sourceId: sourceId,
              source: source
            }).subscribe((userCreated: UserInstance) => {
              observer.next(userCreated);
              observer.complete();
            });
          }
        }
      );
    });
  }

  private createUserKong(user: UserInstance) {
    return Rx.Observable.create(observer => {
      const userKongToCreate = querystring.stringify({
        username: user.sourceId,
        custom_id: user.id
      });
      const options = {
        host: ServerConfigs.userApi.host,
        port: ServerConfigs.userApi.port,
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
        host: ServerConfigs.userApi.host,
        port: ServerConfigs.userApi.port,
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
        host: ServerConfigs.userApi.host,
        port: ServerConfigs.userApi.port,
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
        host: ServerConfigs.userApi.host,
        port: ServerConfigs.userApi.port,
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
        host: ServerConfigs.userApi.host,
        port: ServerConfigs.userApi.port,
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
      host: ServerConfigs.userApi.host,
      port: ServerConfigs.userApi.port,
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
      host: ServerConfigs.userApi.host,
      port: ServerConfigs.userApi.port,
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
      if (user.source !== 'ldap') {
        observer.next();
        observer.complete();
        return;
      }
      const options = {
        host: ServerConfigs.userApi.host,
        port: ServerConfigs.userApi.port,
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
      const jwtExpiration = ServerConfigs.jwtExpiration;

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

  private validateUserLdap(username: string, password: string) {
    return Rx.Observable.create(observer => {
      const ldapC = ServerConfigs.ldap;

      if (!username) {
        observer.error(Boom.unauthorized('Username empty'));
        return;
      } else if (!ldapC || !ldapC.length) {
        observer.error(Boom.badImplementation('Config Ldap missing'));
        return;
      }

      const validate = (index) => {
        this.validatePasswordLdap(ldapC[index], username, password).subscribe(
          userInfo => {
            observer.next(userInfo);
            observer.complete();
          },
          error => {
            index++;
            if (error.output.payload.message === 'Invalid username' &&
                ldapC[index]) {
              validate(index);
            } else {
              observer.error(error);
            }
          }
        );
      };

      validate(0);
    });
  }

  private validatePasswordLdap(ldapConfig: Configs.ILdapConfiguration,
                               username: string,
                               password: string) {

    return Rx.Observable.create(observer => {
      const client = ldap.createClient({
        url: ldapConfig.url
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
      const baseSearch = ldapConfig.baseSearch;
      client.search(baseSearch, opts, function(errSearch, search) {
        search.on('searchEntry', function(entry) {
          ldapres = entry.object;
        });

        search.on('end', function(result) {
          if (ldapres) {
            client.bind(ldapres.dn, Base64.decode(password), function(errBind) {
              if (errBind) {
                let codeError;
                if (errBind.lde_message) {
                    codeError = errBind.lde_message.substr(-4, 3);
                }
                if (codeError === '197' || codeError === '217') {
                  observer.error(Boom.unauthorized('Maximun logins exceeded'));
                } else if (codeError === '223') {
                  observer.error(Boom.unauthorized('Password expired'));
                } else {
                  observer.error(Boom.unauthorized('Wrong password'));
                }
              } else {
                observer.next(ldapres);
                observer.complete();
              }
            });
          } else {
            observer.error(Boom.unauthorized('Invalid username'));
          }
        });
      });
    });
  }


  private validateSocialToken(token: string, typeConnection: string) {
    if (typeConnection === 'facebook') {
      return this.validateFacebookToken(token);
    } else if (typeConnection === 'google') {
      return this.validateGoogleToken(token);
    } else {
      return Rx.Observable.create(observer => {
        observer.error(Boom.badRequest('Invalid connection type'));
      });
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

        let dataStr= '';
        res.on('data', (chunk) => {
          dataStr += chunk;
        });

        res.on('end', () => {
          const data = JSON.parse(dataStr);
          if (data && !data.error) {
            observer.next(data);
          } else {
            observer.error(Boom.unauthorized('Invalid token'));
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

      const key = ServerConfigs.googleKey;
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

        let dataStr= '';
        res.on('data', (chunk) => {
          dataStr += chunk;
        });

        res.on('end', () => {
          const data = JSON.parse(dataStr);
          if (data && !data.error) {
            const userInfo = {
              email: data.emailAddresses[0].value,
              id: data.names[0].metadata.source.id
            };
            observer.next(userInfo);
          } else {
            observer.error(Boom.unauthorized('Invalid token'));
          }
          observer.complete();
        });
      };

      const req = https.request(options, callback);
      req.end();
    });
  }

}
