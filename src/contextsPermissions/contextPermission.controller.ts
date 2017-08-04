import * as Hapi from 'hapi';
import * as Boom from 'boom';

import { IDatabase } from '../database';
import { IServerConfiguration } from '../configurations';

import {
  IContextPermission,
  ContextPermissionInstance,
  ContextPermission,
  TypePermission
} from './index';

export default class ContextPermissionController {

  private database: IDatabase;
  private configs: IServerConfiguration;
  private contextPermission: ContextPermission;

  constructor(configs: IServerConfiguration, database: IDatabase) {
    this.configs = configs;
    this.database = database;
    this.contextPermission = new ContextPermission(database);
  }

  public createContextPermission(request: Hapi.Request, reply: Hapi.IReply) {
    const owner = request.headers['x-consumer-username'];
    const newContextPermission: IContextPermission = request.payload;

    const contextId = request.params['contextId'];
    newContextPermission['contextId'] = contextId;

    this.contextPermission.getPermissionsByContextId(contextId, owner)
      .subscribe((permission) => {
        if (permission === TypePermission.write) {
          this.database.contextPermission.create(newContextPermission)
            .then((contextPermission) => {
              reply(contextPermission).code(201);
            }).catch((error) => {
              const uniqueFields = ['contextId', 'profil'];
              if (error.name === 'SequelizeUniqueConstraintError' &&
                  error.fields.toString() === uniqueFields.toString()) {
                const message = 'The pair contextId and profil must be unique.';
                reply(Boom.conflict(message));
              } else {
                reply(Boom.badImplementation(error));
              }
            });
        } else {
          reply(Boom.unauthorized());
        }
      });
  }

  public updateContextPermission(request: Hapi.Request, reply: Hapi.IReply) {
    const owner = request.headers['x-consumer-username'];
    const id = request.params['id'];
    const contextId = request.params['contextId'];
    const contextPermission: IContextPermission = request.payload;

    this.contextPermission.getPermissionsByContextId(contextId, owner)
      .subscribe((permission) => {

        if (permission === TypePermission.write) {
          this.database.contextPermission.update(contextPermission, {
            where: {
              id: id,
              contextId: contextId
            }
          }).then((count: [number, ContextPermissionInstance[]]) => {
            if (count[0]) {
              reply({
                id: id,
                contextId: contextId
              });
            } else {
              reply(Boom.notFound());
            }
          }).catch((error) => {
            const uniqueFields = ['contextId', 'profil'];
            if (error.name === 'SequelizeUniqueConstraintError' &&
                error.fields.toString() === uniqueFields.toString()) {
              const message = 'The pair contextId and profil must be unique.';
              reply(Boom.conflict(message));
            } else {
              reply(Boom.badImplementation(error));
            }
          });
        } else {
          reply(Boom.unauthorized());
        }
      });
  }

  public deleteContextPermission(request: Hapi.Request, reply: Hapi.IReply) {
    const owner = request.headers['x-consumer-username'];
    const id = request.params['id'];
    const contextId = request.params['contextId'];

    this.contextPermission.getPermissionsByContextId(contextId, owner)
      .subscribe((permission) => {
        if (permission === TypePermission.write) {
          this.database.contextPermission.destroy({
            where: {
              id: id,
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

  public getPermissionsByContextId(request: Hapi.Request, reply: Hapi.IReply) {
    const owner = request.headers['x-consumer-username'];
    const contextId = request.params['contextId'];

    this.contextPermission.getPermissionsByContextId(contextId, owner)
      .subscribe((permission) => {
        if (permission === TypePermission.write) {
          this.database.contextPermission.findAll({
            where: {
              contextId: contextId
            }
          }).then((contextsPermissions: Array<any>) => {
            reply({
              permissions: contextsPermissions
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
