import * as Hapi from 'hapi';
import * as Boom from 'boom';

import { IDatabase } from '../database';
import { IServerConfiguration } from '../configurations';

import { ContextPermission, TypePermission } from '../contextsPermissions';
import { IToolContext, ToolContextInstance } from './toolContext.model';

export default class ToolContextController {

  private database: IDatabase;
  private configs: IServerConfiguration;
  private contextPermission: ContextPermission;

  constructor(configs: IServerConfiguration, database: IDatabase) {
    this.configs = configs;
    this.database = database;
    this.contextPermission = new ContextPermission(database);
  }

  public createToolContext(request: Hapi.Request, reply: Hapi.IReply) {
    const owner = request.headers['x-consumer-username'];
    const newToolContext: IToolContext = request.payload;

    const contextId = request.params['contextId'];
    newToolContext['contextId'] = contextId;

    this.contextPermission.getPermissionsByContextId(contextId, owner)
      .subscribe((permission) => {
        if (permission === TypePermission.write) {
          this.database.toolContext.create(newToolContext)
            .then((toolContext) => {
              reply(toolContext).code(201);
            }).catch((error) => {
              const uniqueFields = ['contextId', 'toolId'];
              if (error.name === 'SequelizeUniqueConstraintError' &&
                error.fields.toString() === uniqueFields.toString()) {
                const message = 'The pair contextId and toolId must be unique.';
                reply(Boom.conflict(message));
              } else if (error.name === 'SequelizeForeignKeyConstraintError') {
                const message = 'Tool can not be found.';
                reply(Boom.badRequest(message));
              } else {
                reply(Boom.badImplementation(error));
              }
            });
        } else {
          reply(Boom.unauthorized());
        }
      });
  }

  public updateToolContext(request: Hapi.Request, reply: Hapi.IReply) {
    const owner = request.headers['x-consumer-username'];
    const toolId = request.params['toolId'];
    const contextId = request.params['contextId'];
    const toolContext: IToolContext = request.payload;

    this.contextPermission.getPermissionsByContextId(contextId, owner)
      .subscribe((permission) => {

        if (permission === TypePermission.write) {
          this.database.toolContext.update(toolContext, {
            where: {
              toolId: toolId,
              contextId: contextId
            }
          }).then((count: [number, IToolContext[]]) => {
            if (count[0]) {
              reply({
                toolId: toolId,
                contextId: contextId
              });
            } else {
              reply(Boom.notFound());
            }
          }).catch((error) => {
            reply(Boom.badImplementation(error));
          });
        } else {
          reply(Boom.unauthorized());
        }
      });
  }

  public deleteToolContext(request: Hapi.Request, reply: Hapi.IReply) {
    const owner = request.headers['x-consumer-username'];
    const toolId = request.params['toolId'];
    const contextId = request.params['contextId'];

    this.contextPermission.getPermissionsByContextId(contextId, owner)
      .subscribe((permission) => {
        if (permission === TypePermission.write) {
          this.database.toolContext.destroy({
            where: {
              toolId: toolId,
              contextId: contextId
            }
          }).then((count: number) => {
            if (count) {
              reply({}).code(204);
            } else {
              reply(Boom.notFound());
            }
          }).catch((error) => {
            reply(Boom.badImplementation(error));
          });
        } else {
          reply(Boom.unauthorized());
        }
      });
  }

  public getToolContextById(request: Hapi.Request, reply: Hapi.IReply) {

    const owner = request.headers['x-consumer-username'];
    const toolId = request.params['toolId'];
    const contextId = request.params['contextId'];

    this.contextPermission.getPermissionsByContextId(contextId, owner)
      .subscribe((permission) => {
        if (permission) {
          this.database.toolContext.findOne({
            where: {
              toolId: toolId,
              contextId: contextId
            }
          }).then((toolContext: ToolContextInstance) => {
            if (toolContext) {
              reply(toolContext);
            } else {
              reply(Boom.notFound());
            }
          }).catch((error) => {
            reply(Boom.badImplementation(error));
          });
        } else {
          reply(Boom.unauthorized());
        }
      });
  }

  public getToolsByContextId(request: Hapi.Request, reply: Hapi.IReply) {

    const owner = request.headers['x-consumer-username'];
    const contextId = request.params['contextId'];

    this.contextPermission.getPermissionsByContextId(contextId, owner)
      .subscribe((permission) => {
        if (permission) {
          this.database.toolContext.findAll({
            where: {
              contextId: contextId
            }
          }).then((toolContext: Array<any>) => {
            reply({
              tools: toolContext
            });
          }).catch((error) => {
            reply(Boom.badImplementation(error));
          });
        } else {
          reply(Boom.unauthorized());
        }
      });
  }

}
