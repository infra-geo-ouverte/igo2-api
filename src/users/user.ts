import * as Rx from 'rxjs';
import * as http from 'http';

import * as Configs from '../configurations';

const serverConfigs = Configs.getServerConfig();

export class User {

  static getProfils(id: string) {
    return Rx.Observable.create(observer => {
      if (!id) {
        return undefined;
      }

      const options = {
        host: serverConfigs.userApi.host,
        port: serverConfigs.userApi.port,
        path: `/consumers/${id}/acls`,
        method: 'GET'
      };

      const callback = (res) => {
        res.setEncoding('utf8')  ;
        res.on('data', (d) => {
          const data = JSON.parse(d);

          if (!data.data) {
            const message = `User '${id}' can not be found.`;
            observer.error(new Error(message));
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
}
