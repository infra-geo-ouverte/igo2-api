import axios from 'axios';
import * as Sequelize from 'sequelize';

import * as URL from 'url';
import * as Boom from '@hapi/boom';

import { getServerConfig } from '../configurations';
import { ObjectUtils } from '@igo2/base-api';
import { User } from './user.model';

const ServerConfigs = getServerConfig();

export class UserApi {

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
    if (acl && acl.config.allow && acl.config.allow.length) {
      for (const profil of profils) {
        const i = acl.config.allow.indexOf(profil);
        if (i !== -1) {
          allowed = true;
          break;
        }
      }
    } else if (acl && acl.config.deny && acl.config.deny.length) {
      allowed = true;
      for (const profil of profils) {
        const i = acl.config.deny.indexOf(profil);
        if (i !== -1) {
          allowed = false;
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

  static async getUser(username: string): Promise<User> {
    return await User
      .findOne({
        where: {
          sourceId: username
        }
      })
      .then((user: User) => {
        return user;
      });
  }

  static async getAllUsers(limit: number = 10, filter?: string): Promise<User[]> {
    const Utils = Sequelize.Utils;
    const opts: any = filter
      ? {
          where: {
            [Sequelize.Op.or]: [
              {
                sourceId: {
                  [Sequelize.Op.iLike]: `%${filter}%`
                }
              },
              new Utils.Where(new Utils.Fn('concat', [new Utils.Col('firstName'), ' ', new Utils.Col('lastName')]), {
                [Sequelize.Op.iLike]: `%${filter}%`
              })
            ]
          }
        }
      : {};

    opts.limit = limit;

    return await User.findAll(opts).then((users: User[]) => {
      return users.map(u => ObjectUtils.removeNull(u.get()));
    });
  }
}
