import * as Rx from 'rxjs';
import * as http from 'http';

export class User {

  static getProfils(id: string) {
    return Rx.Observable.create(observer => {
      if (!id) {
        return undefined;
      }

      const options = {
        host: 'localhost',
        port: 8001,
        path: `/consumers/${id}/acls`,
        method: 'GET'
      };

      const callback = (res) => {
        res.setEncoding('utf8')  ;
        res.on('data', (d) => {
          const data = JSON.parse(d);
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
