import * as Rx from 'rxjs';
import * as Boom from 'boom';

import { IDatabase, database } from '../database';
import { ObjectUtils } from '../utils';

import { IContext, ContextInstance, ContextDetailed } from './context.model';

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
    includeTools = false): Rx.Observable<ContextDetailed> {

    const include = [];
    if (includeLayers) { include.push(this.database.layer); }
    if (includeTools) { include.push(this.database.tool); }

    return Rx.Observable.create(observer => {
      this.database.context.findOne({
        include: include,
        where: {
          id: id
        }
      }).then((context: ContextDetailed) => {
        if (context) {
          if (includeLayers || includeTools) {
            const plainDetails = this.contextObjToPlainObj(context);
            observer.next(plainDetails);
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

  private contextObjToPlainObj(context): ContextDetailed {

    let plain: any = context.get();
    plain.layers = [];
    plain.tools = [];
    plain.toolbar = [];

    for (const tool of context.tools) {
      const plainTool = tool.get();
      Object.assign(plainTool.options, plainTool.toolContext.options);
      plainTool.toolContext = null;
      plain.tools.push(plainTool);
      if (plainTool.inToolbar) {
        plain.toolbar.push(plainTool.name);
      }
    }

    for (const layer of context.layers) {
      const plainLayer = layer.get();
      Object.assign(plainLayer.view, plainLayer.layerContext.view);
      Object.assign(plainLayer, plainLayer.layerContext.options);
      plainLayer.order = plainLayer.layerContext.order;
      plainLayer.layerContext = null;
      plain.layers.push(plainLayer);
    }

    plain = ObjectUtils.removeNull(plain);
    plain.layers = plain.layers.sort(
      (a, b) => a.order < b.order ? -1 : a.order > b.order ? 1 : 0
    );

    return plain;
  }

}
