import axios from 'axios';
import * as URL from 'url';
import * as Boom from 'boom';

import * as Configs from '../configurations';
import { database } from '../database';
import { ObjectUtils } from '../utils';

const ServerConfigs = Configs.getServerConfig();


export class UserApi {

  static async getRoutes() {

    const res = await axios
      .get(`${ServerConfigs.userApi}/routes`)
      .catch(e => {
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

    const routeFound = routes.data.find((route) => {
      return route.paths
        && !!route.paths.length
        && route.paths.indexOf(uri) !== -1;
    });

    return routeFound;
  }

  static async getServiceById(id) {
    const res = await axios
      .get(`${ServerConfigs.userApi}/services/${id}`)
      .catch(e => {
        throw Boom.badImplementation(e);
      });

    return res.data;
  }

  static async getPlugins(id) {
    const res = await axios
      .get(`${ServerConfigs.userApi}/services/${id}/plugins`)
      .catch(e => {
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
      return false;
    }
    const acl = plugins.data.find(
      (plugin) => plugin.name === 'acl' && plugin.enabled
    );
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
    url = URL.parse(url);

    const localhost = ServerConfigs.localhost;
    const localhosts = localhost ? localhost.hosts : [];
    if ((!url.host || localhosts.indexOf(url.host) !== -1) &&
      UserApi.isInBasePath(url.pathname)) {

      const uri = url.pathname.substring(9);
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

  static async getProfils(id: string): Promise<string[]> {
    if (!id) {
      return [];
    }

    const res = await axios
      .get(`${ServerConfigs.userApi}/consumers/${id}/acls`)
      .catch(e => {
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

  static async info(id: string): Promise<any> {
    return await database.user
      .findOne({
        where: {
          id: id
        }
      })
      .then((user) => {
        if (!user) {
          throw Boom.notFound();
        }
        return ObjectUtils.removeNull(user.get());
      });
  }

}
