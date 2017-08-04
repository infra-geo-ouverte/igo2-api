import * as Hapi from 'hapi';
import * as Boom from 'boom';

import { IDatabase } from '../database';
import { IServerConfiguration } from '../configurations';

import { ContextPermission, TypePermission } from '../contextsPermissions';
import { ILayerContext, LayerContextInstance } from './layerContext.model';


export default class LayerContextController {

  private database: IDatabase;
  private configs: IServerConfiguration;
  private contextPermission: ContextPermission;

  constructor(configs: IServerConfiguration, database: IDatabase) {
    this.configs = configs;
    this.database = database;
    this.contextPermission = new ContextPermission(database);
  }

  public createLayerContext(request: Hapi.Request, reply: Hapi.IReply) {
    const owner = request.headers['x-consumer-username'];
    const newLayerContext: ILayerContext = request.payload;

    const contextId = request.params['contextId'];
    newLayerContext['contextId'] = contextId;

    this.contextPermission.getPermissionsByContextId(contextId, owner)
      .subscribe((permission) => {
        if (permission === TypePermission.write) {
          this.database.layerContext.create(newLayerContext)
            .then((layerContext) => {
              reply(layerContext).code(201);
            }).catch((error) => {
              const uniqueFields = ['contextId', 'layerId'];
              if (error.name === 'SequelizeUniqueConstraintError' &&
                error.fields.toString() === uniqueFields.toString()) {
                const msg = 'The pair contextId and layerId must be unique.';
                reply(Boom.conflict(msg));
              } else if (error.name === 'SequelizeForeignKeyConstraintError') {
                const message = 'Layer can not be found.';
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

  public updateLayerContext(request: Hapi.Request, reply: Hapi.IReply) {
    const owner = request.headers['x-consumer-username'];
    const layerId = request.params['layerId'];
    const contextId = request.params['contextId'];
    const layerContext: ILayerContext = request.payload;

    this.contextPermission.getPermissionsByContextId(contextId, owner)
      .subscribe((permission) => {

        if (permission === TypePermission.write) {
          this.database.layerContext.update(layerContext, {
            where: {
              layerId: layerId,
              contextId: contextId
            }
          }).then((count: [number, ILayerContext[]]) => {
            if (count[0]) {
              reply({
                layerId: layerId,
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

  public deleteLayerContext(request: Hapi.Request, reply: Hapi.IReply) {
    const owner = request.headers['x-consumer-username'];
    const layerId = request.params['layerId'];
    const contextId = request.params['contextId'];

    this.contextPermission.getPermissionsByContextId(contextId, owner)
      .subscribe((permission) => {
        if (permission === TypePermission.write) {
          this.database.layerContext.destroy({
            where: {
              layerId: layerId,
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

  public getLayerContextById(request: Hapi.Request, reply: Hapi.IReply) {
    const owner = request.headers['x-consumer-username'];
    const layerId = request.params['layerId'];
    const contextId = request.params['contextId'];

    this.contextPermission.getPermissionsByContextId(contextId, owner)
      .subscribe((permission) => {
        if (permission) {
          this.database.layerContext.findOne({
            where: {
              layerId: layerId,
              contextId: contextId
            }
          }).then((layerContext: LayerContextInstance) => {
            if (layerContext) {
              reply(layerContext);
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

  public getLayersByContextId(request: Hapi.Request, reply: Hapi.IReply) {
    const owner = request.headers['x-consumer-username'];
    const contextId = request.params['contextId'];

    this.contextPermission.getPermissionsByContextId(contextId, owner)
      .subscribe((permission) => {
        if (permission) {
          this.database.layerContext.findAll({
            where: {
              contextId: contextId
            }
          }).then((layerContext: Array<any>) => {
            reply({
              layers: layerContext
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
