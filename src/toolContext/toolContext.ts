import * as Rx from 'rxjs';
import * as Boom from 'boom';
import * as async from 'async';

import { IDatabase, database } from '../database';
import { ObjectUtils } from '../utils';

import { IToolContext, ToolContextInstance } from './toolContext.model';

export class ToolContext {

  private database: IDatabase = database;

  constructor() {}

  public create(toolContext: IToolContext): Rx.Observable<ToolContextInstance> {
    return Rx.Observable.create(observer => {
      this.database.toolContext.create(toolContext)
        .then((createdToolContext) => {
          observer.next(createdToolContext);
          observer.complete();
        }).catch((error) => {
          const uniqueFields = ['contextId', 'toolId'];
          if (error.name === 'SequelizeUniqueConstraintError' &&
            error.fields.toString() === uniqueFields.toString()) {
            const message = 'The pair contextId and toolId must be unique.';
            observer.error(Boom.conflict(message));
          } else if (error.name === 'SequelizeForeignKeyConstraintError') {
            const message = 'Tool can not be found.';
            observer.error(Boom.badRequest(message));
          } else {
            observer.error(Boom.badImplementation(error));
          }
        });
    });
  }

  public update(contextId: string, toolId: string,
    toolContext: IToolContext): Rx.Observable<ToolContextInstance> {

    return Rx.Observable.create(observer => {
      this.database.toolContext.update(toolContext, {
        where: {
          toolId: toolId,
          contextId: contextId
        }
      }).then((count: [number, ToolContextInstance[]]) => {
        if (count[0]) {
          observer.next({
            toolId: toolId,
            contextId: contextId
          });
          observer.complete();
        } else {
          observer.error(Boom.notFound());
        }
      }).catch((error) => {
        observer.error(Boom.badImplementation(error));
      });
    });
  }

  public delete(contextId: string, toolId: string): Rx.Observable<{}> {
    return Rx.Observable.create(observer => {
      this.database.toolContext.destroy({
        where: {
          toolId: toolId,
          contextId: contextId
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

  public deleteByContextId(contextId: string): Rx.Observable<{}> {
    return Rx.Observable.create(observer => {
      this.database.toolContext.destroy({
        where: {
          contextId: contextId
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

  public getByContextId(
    contextId: string): Rx.Observable<ToolContextInstance[]> {

    return Rx.Observable.create(observer => {
      this.database.toolContext.findAll({
        where: {
          contextId: contextId
        }
      }).then((toolContextsContexts: ToolContextInstance[]) => {
          const plainToolContextsContexts = toolContextsContexts.map(
            (toolContext) => ObjectUtils.removeNull(toolContext.get())
          );
          observer.next(plainToolContextsContexts);
          observer.complete();
        }).catch((error) => {
          observer.error(Boom.badImplementation(error));
        });
    });
  }

  public getById(contextId: string,
    toolId: string): Rx.Observable<ToolContextInstance> {

    return Rx.Observable.create(observer => {
      this.database.toolContext.findOne({
        where: {
          toolId: toolId,
          contextId: contextId
        }
      }).then((toolContext: ToolContextInstance) => {
        if (toolContext) {
          observer.next(ObjectUtils.removeNull(toolContext.get()));
          observer.complete();
        } else {
          observer.error(Boom.notFound());
        }
      }).catch((error) => {
        observer.error(Boom.badImplementation(error));
      });
    });
  }

  public bulkCreate(contextId: string, tools: IToolContext[]) {
    return Rx.Observable.create(observer => {
      let count = 0;
      async.forEach(tools,
        (tool: IToolContext, next) => {
          if (tool.id) {
            this.create({
              contextId: contextId,
              toolId: tool.id
            }).subscribe(
              (rep) => { count++; next(); },
              (error) => next(error)
            );
          } else {
            next();
          }
        },
        (error) => {
          if (error) {
            observer.error(error);
          } else {
            observer.next(count);
            observer.complete();
          }
        }
      );
    });
  }

}
