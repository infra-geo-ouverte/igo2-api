import * as Rx from 'rxjs';
import * as Boom from 'boom';

import { IDatabase, database } from '../database';
import { ObjectUtils } from '../utils';

import { IContext, ContextInstance } from './context.model';

export class Context {

  private database: IDatabase = database;

  constructor() {}

  public create(context: IContext): Rx.Observable<ContextInstance> {
    return Rx.Observable.create(observer => {
      this.database.context.create(context).then((createdContext) => {
        observer.next(createdContext);
        observer.complete();
      }).catch((error) => {
        observer.error(Boom.badImplementation(error));
      });
    });
  }

  public update(id: string, context: IContext): Rx.Observable<ContextInstance> {
    return Rx.Observable.create(observer => {
      this.database.context.update(context, {
        where: {
          id: id
        }
      }).then((count: [number, ContextInstance[]]) => {
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
      this.database.context.destroy({
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

  public get(): Rx.Observable<ContextInstance[]> {
    return Rx.Observable.create(observer => {
      this.database.context.findAll().then((contexts: ContextInstance[]) => {
        const plainContexts = contexts.map(
          (context) => ObjectUtils.removeNull(context.get())
        );
        observer.next(plainContexts);
        observer.complete();
      }).catch((error) => {
        observer.error(Boom.badImplementation(error));
      });
    });
  }

  public getById(id: string, includeLayers = false,
    includeTools = false): Rx.Observable<ContextInstance> {

    const include = [];
    if (includeLayers) { include.push(this.database.layer); }
    if (includeTools) { include.push(this.database.tool); }

    return Rx.Observable.create(observer => {
      this.database.context.findOne({
        include: include,
        where: {
          id: id
        }
      }).then((context: ContextInstance) => {
        if (context) {
          if (includeLayers || includeTools) {
            observer.next(context);
          } else {
            observer.next(ObjectUtils.removeNull(context.get()));
          }
          observer.complete();
        } else {
          observer.error(Boom.notFound());
        }
      }).catch((error) => {
        observer.error(Boom.badImplementation(error));
      });
    });
  }

}
