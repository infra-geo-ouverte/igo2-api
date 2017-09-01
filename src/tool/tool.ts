import * as Rx from 'rxjs';
import * as Boom from 'boom';

import { IDatabase, database } from '../database';
import { ObjectUtils } from '../utils';

import { ITool, ToolInstance } from './tool.model';

export class Tool {

  private database: IDatabase = database;

  constructor() {}

  public create(tool: ITool): Rx.Observable<ToolInstance> {
    return Rx.Observable.create(observer => {
      this.database.tool.create(tool).then((createdTool) => {
        observer.next(createdTool);
        observer.complete();
      }).catch((error) => {
        observer.error(Boom.badImplementation(error));
      });
    });
  }

  public update(id: string, tool: ITool): Rx.Observable<ToolInstance> {
    return Rx.Observable.create(observer => {
      this.database.tool.update(tool, {
        where: {
          id: id
        }
      }).then((count: [number, ToolInstance[]]) => {
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
      this.database.tool.destroy({
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

  public get(): Rx.Observable<ToolInstance[]> {
    return Rx.Observable.create(observer => {
      this.database.tool.findAll().then((tools: ToolInstance[]) => {
        const plainTools = tools.map(
          (tool) => ObjectUtils.removeNull(tool.get())
        );
        observer.next(plainTools);
        observer.complete();
      }).catch((error) => {
        observer.error(Boom.badImplementation(error));
      });
    });
  }

  public getById(id: string): Rx.Observable<ToolInstance> {
    return Rx.Observable.create(observer => {
      this.database.tool.findOne({
        where: {
          id: id
        }
      }).then((tool: ToolInstance) => {
        if (tool) {
          observer.next(ObjectUtils.removeNull(tool.get()));
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
