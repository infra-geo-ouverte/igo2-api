import * as Hapi from 'hapi';
import * as Boom from 'boom';
import {
  IContextPermission,
  ContextPermissionInstance
} from './contextPermission.model';
import { IDatabase } from '../database';
import { IServerConfigurations } from '../configurations';

export default class ContextPermissionController {

  private database: IDatabase;
  private configs: IServerConfigurations;

  constructor(configs: IServerConfigurations, database: IDatabase) {
    this.configs = configs;
    this.database = database;
  }

  public createContextPermission(request: Hapi.Request, reply: Hapi.IReply) {
    const newContextPermission: IContextPermission = request.payload;
    this.database.contextPermission.create(newContextPermission)
      .then((contextPermission) => {
        reply(contextPermission).code(201);
      }).catch((error) => {
        reply(Boom.badImplementation(error));
      });
  }

  public updateContextPermission(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['id'];
    const contextPermission: IContextPermission = request.payload;

    this.database.contextPermission.update(contextPermission, {
      where: {
        id: id
      }
    }).then((count: [number, ContextPermissionInstance[]]) => {
      if (count[0]) {
        reply({});
      } else {
        reply(Boom.notFound());
      }
    }).catch((error) => {
      reply(Boom.badImplementation(error));
    });
  }

  public deleteContextPermission(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['id'];
    this.database.contextPermission.destroy({
      where: {
        id: id
      }
    }).then((count: number) => {
      if (count) {
        reply({});
      } else {
        reply(Boom.notFound());
      }
    }).catch((error) => {
      reply(Boom.badImplementation(error));
    });
  }

  public getContextPermissionById(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['id'];
    this.database.contextPermission.findOne({
      where: {
        id: id
      }
    }).then((contextPermission: ContextPermissionInstance) => {
      if (contextPermission) {
        reply(contextPermission);
      } else {
        reply(Boom.notFound());
      }
    }).catch((error) => {
      reply(Boom.badImplementation(error));
    });
  }

  public getcontextsPermissions(request: Hapi.Request, reply: Hapi.IReply) {
    this.database.contextPermission.findAll()
      .then((contextsPermissions: Array<ContextPermissionInstance>) => {
        reply(contextsPermissions);
      }).catch((error) => {
        reply(Boom.badImplementation(error));
      });
  }


  public getPermissionsByContextId(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['id'];

    this.database.context.findAll({
      include: [ this.database.contextPermission ],
      where: {
        id: id
      }
    }).then((contextsPermissions: Array<any>) => {
      reply(contextsPermissions);
    }).catch((error) => {
      reply(Boom.badImplementation(error));
    });
  }

}
