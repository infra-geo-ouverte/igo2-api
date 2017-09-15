import * as Rx from 'rxjs';
import * as http from 'http';
import * as URL from 'url';

import * as Configs from '../configurations';

const ServerConfigs = Configs.getServerConfig();

export class Api {

  static get() {
    return Rx.Observable.create(observer => {
      const options = {
        host: ServerConfigs.userApi.host,
        port: ServerConfigs.userApi.port,
        path: `/apis`,
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

  static getByUri(uri: string) {
    return Rx.Observable.create(observer => {
      if (!uri) {
        observer.next(undefined);
        observer.complete();
        return;
      }

      Api.get().subscribe((apis) => {
        if (!apis || !apis.data || !apis.data.length ) {
          observer.next(undefined);
          observer.complete();
          return;
        }

        const apiFound = apis.data.find((api) => {
          return api.uris && !!api.uris.length && api.uris.indexOf(uri) !== -1;
        });

        observer.next(apiFound);
        observer.complete();
      });
    });
  }

  static getById(id) {
    return Rx.Observable.create(observer => {
      const options = {
        host: ServerConfigs.userApi.host,
        port: ServerConfigs.userApi.port,
        path: `/apis/${id}`,
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
        path: `/apis/${id}/plugins`,
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


  static verifyPermission(api, profils) {
    return Rx.Observable.create(observer => {
      if (!api) {
        observer.next(false);
        observer.complete();
        return;
      }

      Api.getPlugins(api.id).subscribe((plugins) => {
        const acl = plugins.data.find((plugin) => plugin.name === 'acl');
        let allowed = acl ? false : true;
        if (acl && acl.config.whitelist) {
          for (const profil of profils) {
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
        Api.getByUri(uri).subscribe((api) => {
          Api.verifyPermission(api, profils).subscribe((isAllowed) => {
            observer.next(isAllowed);
            observer.complete();
          });
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
