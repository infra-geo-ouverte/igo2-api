import * as Rx from 'rxjs';
import * as Boom from 'boom';

import { IDatabase, database } from '../database';
import { ObjectUtils } from '../utils';
import { User, Api } from '../user';

import { ICatalog, CatalogInstance } from './catalog.model';

export class Catalog {

  private database: IDatabase = database;

  constructor() {}

  public create(catalog: ICatalog): Rx.Observable<CatalogInstance> {
    return Rx.Observable.create(observer => {
      this.database.catalog.create(catalog).then((createdCatalog) => {
        observer.next(createdCatalog);
        observer.complete();
      }).catch((error) => {
        observer.error(Boom.badImplementation(error));
      });
    });
  }

  public update(id: string, catalog: ICatalog): Rx.Observable<CatalogInstance> {

    return Rx.Observable.create(observer => {
      this.database.catalog.update(catalog, {
        where: {
          id: id
        }
      }).then((count: [number, CatalogInstance[]]) => {
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

  public delete(id: string): Rx.Observable<{}> {
    return Rx.Observable.create(observer => {
      this.database.catalog.destroy({
        where: {
          id: id
        }
      }).then((count: number) => {
        if (count) {
          observer.next({});
          observer.complete();
        } else {
          observer.error(Boom.notFound());
        }
      }).catch((error) => {
        observer.error(Boom.badImplementation(error));
      });
    });
  }

  public get(user: string): Rx.Observable<CatalogInstance[]> {
    return Rx.Observable.create(observer => {
      this.database.catalog.findAll().then((catalogs: CatalogInstance[]) => {
        const plainCatalogs = catalogs.map(
          (catalog) => ObjectUtils.removeNull(catalog.get())
        );

        let callsLeft = plainCatalogs.length;
        if (!callsLeft) {
          observer.next(plainCatalogs);
          observer.complete();
          return;
        }

        const catalogsAllowed = [];
        User.getProfils(user).subscribe((profils) => {
          profils.push(user);

          for (const c of plainCatalogs) {
            Api.verifyPermissionByUrl(c.url, profils).subscribe((isAllowed) => {
              callsLeft--;
              if (isAllowed) {
                catalogsAllowed.push(c);
              }
              if (callsLeft === 0) {
                observer.next(catalogsAllowed);
                observer.complete();
              }
            });
          }
        });
      }).catch((error) => {
        observer.error(Boom.badImplementation(error));
      });
    });
  }

  public getById(id: string, user: string): Rx.Observable<CatalogInstance> {
    return Rx.Observable.create(observer => {
      this.database.catalog.findOne({
        where: {
          id: id
        }
      }).then((catalog: CatalogInstance) => {
        if (catalog) {
          const catalogPlain = ObjectUtils.removeNull(catalog.get());
          User.getProfils(user).subscribe((profils) => {
            profils.push(user);
            Api.verifyPermissionByUrl(catalogPlain.url, profils)
              .subscribe((isAllowed) => {
                if (isAllowed) {
                  observer.next(catalogPlain);
                  observer.complete();
                } else {
                  observer.error(Boom.forbidden());
                }
            });
          });
        } else {
          observer.error(Boom.notFound());
        }
      }).catch((error) => {
        observer.error(Boom.badImplementation(error));
      });
    });
  }
}
