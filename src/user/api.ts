import * as Rx from 'rxjs';
import * as http from 'http';
import * as URL from 'url';

import * as Configs from '../configurations';

const ServerConfigs = Configs.getServerConfig();


export class Api {

  static getRoutes() {
    return Rx.Observable.create(observer => {
      const options = {
        host: ServerConfigs.userApi.host,
        port: ServerConfigs.userApi.port,
        path: `/routes`,
        method: 'GET'
      };

      const callback = (res) => {
        res.setEncoding('utf8')  ;
        res.on('data', (d) => {
          const routes = JSON.parse(d);
          observer.next(routes);
          observer.complete();
        });
      };

      const req = http.request(options, callback);
      req.end();
    });
  }

  static getRouteByUri(uri: string) {
    return Rx.Observable.create(observer => {
      if (!uri) {
        observer.next(undefined);
        observer.complete();
        return;
      }

      Api.getRoutes().subscribe((routes) => {
        if (!routes || !routes.data || !routes.data.length ) {
          observer.next(undefined);
          observer.complete();
          return;
        }

        const routeFound = routes.data.find((route) => {
          return route.paths
            && !!route.paths.length
            && route.paths.indexOf(uri) !== -1;
        });

        observer.next(routeFound);
        observer.complete();
      });
    });
  }

  static getServiceById(id) {
    return Rx.Observable.create(observer => {
      const options = {
        host: ServerConfigs.userApi.host,
        port: ServerConfigs.userApi.port,
        path: `/services/${id}`,
        method: 'GET'
      };

      const callback = (res) => {
        res.setEncoding('utf8')  ;
        res.on('data', (d) => {
          const apis = JSON.parse(d);
          observer.next(apis);
          observer.complete();
        });
      };

      const req = http.request(options, callback);
      req.end();
    });
  }

  static getPlugins(id) {
    return Rx.Observable.create(observer => {
      const options = {
        host: ServerConfigs.userApi.host,
        port: ServerConfigs.userApi.port,
        path: `/services/${id}/plugins`,
        method: 'GET'
      };

      const callback = (res) => {
        res.setEncoding('utf8')  ;
        res.on('data', (d) => {
          const apis = JSON.parse(d);
          observer.next(apis);
          observer.complete();
        });
      };

      const req = http.request(options, callback);
      req.end();
    });
  }


  static verifyServicePermission(route, profils) {
    return Rx.Observable.create(observer => {
      if (!route || !route.service) {
        observer.next(false);
        observer.complete();
        return;
      }

      Api.getPlugins(route.service.id).subscribe((plugins) => {
        if (!plugins.data) {
          observer.next(false);
          observer.complete();
          return;
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
        observer.next(allowed);
        observer.complete();
      });
    });
  }

  static verifyPermissionByUrl(url, profils) {
    return Rx.Observable.create(observer => {
      url = URL.parse(url);

      const localhost = ServerConfigs.localhost;
      const localhosts = localhost ? localhost.hosts : [];
      if ((!url.host || localhosts.indexOf(url.host) !== -1) &&
          Api.isInBasePath(url.pathname)) {

        const uri = url.pathname.substring(9);
        Api.getRouteByUri(uri).subscribe((route) => {
          Api.verifyServicePermission(route, profils).subscribe(
            (isAllowed) => {
              observer.next(isAllowed);
              observer.complete();
            }
          );
        });
      } else {
        observer.next(true);
        observer.complete();
      }
    });
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

}
