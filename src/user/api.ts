import axios from 'axios';
import * as Sequelize from 'sequelize';

import * as URL from 'url';
import * as Boom from 'boom';

import { Config, ObjectUtils, IDatabase, database } from '@igo2/base-api';
import { UserInstance } from './user.model';

const ServerConfigs = Config.getServerConfig();

export class UserApi {
  static database: IDatabase = database;

  static async getRoutes() {
    const res = await axios.get(`${ServerConfigs.userApi}/routes`).catch(e => {
      throw Boom.badImplementation(e);
    });

    return res.data;
  }

  static async getRouteByUri(uri: string) {
    if (!uri) {
      return;
    }

    const routes = await UserApi.getRoutes();

    if (!routes || !routes.data || !routes.data.length) {
      return;
    }

    const routeFound = routes.data.find(route => {
      if (route.paths && !!route.paths.length) {
        const pathFiltered = route.paths.filter(path => {
          return path.length > 3 && uri.indexOf(path) === 0;
        });

        return pathFiltered.length > 0;
      }
      return false;
    });

    return routeFound;
  }

  static async getServiceById(id) {
    const res = await axios.get(`${ServerConfigs.userApi}/services/${id}`).catch(e => {
      throw Boom.badImplementation(e);
    });

    return res.data;
  }

  static async getPlugins(id) {
    const res = await axios.get(`${ServerConfigs.userApi}/services/${id}/plugins`).catch(e => {
      throw Boom.badImplementation(e);
    });

    return res.data;
  }

  static async verifyServicePermission(route, profils) {
    if (!route || !route.service) {
      return false;
    }

    const plugins = await UserApi.getPlugins(route.service.id);
    if (!plugins.data) {
      return true;
    }
    const acl = plugins.data.find(plugin => plugin.name === 'acl' && plugin.enabled);
    let allowed = acl ? false : true;
    if (acl && acl.config.whitelist) {
      for (const profil of profils) {
        // TODO blacklist
        const i = acl.config.whitelist.indexOf(profil);
        if (i !== -1) {
          allowed = true;
          break;
        }
      }
    }
    return allowed;
  }

  static async verifyPermissionByUrl(url, profils) {
    if (!url) {
      return true;
    }
    const urlObj = URL.parse(url);
    url = urlObj ? urlObj.protocol + '//' + urlObj.hostname : '';

    const localhost = ServerConfigs.localhost;
    const localhosts = localhost ? localhost.hosts : [];
    if ((!urlObj.host || localhosts.indexOf(url) !== -1) && UserApi.isInBasePath(urlObj.pathname)) {
      const uri = urlObj.pathname;
      const route = await UserApi.getRouteByUri(uri);
      return await UserApi.verifyServicePermission(route, profils);
    } else {
      return true;
    }
  }

  static isInBasePath(pathname) {
    const localhost = ServerConfigs.localhost;
    const basePaths = localhost ? localhost.basePaths : [];
    let found = false;
    for (const base of basePaths) {
      if (pathname.substr(0, base.length) === base) {
        found = true;
        break;
      }
    }
    return found;
  }

  static async getProfils(id: string, profilsHeaders?: string): Promise<string[]> {
    if (profilsHeaders) {
      return profilsHeaders.split(', ');
    }

    if (!id) {
      return [];
    }

    const res = await axios.get(`${ServerConfigs.userApi}/consumers/${id}/acls`).catch(e => {
      if (e.response && e.response.status === 404) {
        throw Boom.badRequest(`User '${id}' can not be found.`);
      }
      throw Boom.badImplementation(e);
    });

    const profils = [];
    for (const p of res.data.data) {
      profils.push(p.group);
    }

    return profils;
  }

  static async getUser(username: string): Promise<UserInstance> {
    return await UserApi.database.models.user
      .findOne({
        where: {
          sourceId: username
        }
      })
      .then((user: UserInstance) => {
        return user;
      });
  }

  static async getAllUsers(limit: number = 10, filter?: string): Promise<UserInstance[]> {
    const opts: any = filter
      ? {
          where: {
            [Sequelize.Op.or]: [
              {
                sourceId: {
                  [Sequelize.Op.iLike]: `%${filter}%`
                }
              },
              Sequelize.where(Sequelize.fn('concat', Sequelize.col('firstName'), ' ', Sequelize.col('lastName')), {
                [Sequelize.Op.iLike]: `%${filter}%`
              })
            ]
          }
        }
      : {};

    opts.limit = limit;

    return await UserApi.database.models.user.findAll(opts).then((users: UserInstance[]) => {
      return users.map(u => ObjectUtils.removeNull(u.get()));
    });
  }
}
