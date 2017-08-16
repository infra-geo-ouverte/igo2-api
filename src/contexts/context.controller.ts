import * as Hapi from 'hapi';
import * as Boom from 'boom';

import { IDatabase } from '../database';
import { IServerConfiguration } from '../configurations';
import { ObjectUtils } from '../utils';

import { User } from '../users';
import { TypePermission, ContextPermission } from '../contextsPermissions';

import { ContextInstance, Scope } from './index';


export default class ContextController {

  private database: IDatabase;
  private configs: IServerConfiguration;
  private contextPermission: ContextPermission;

  constructor(configs: IServerConfiguration, database: IDatabase) {
    this.configs = configs;
    this.database = database;
    this.contextPermission = new ContextPermission(database);
  }

  public createContext(request: Hapi.Request, reply: Hapi.IReply) {
    const newContext = request.payload;

    newContext.owner = request.headers['x-consumer-username'];

    this.database.context.create(newContext/*, {
      include: [
        this.database.tool
      ]
    }*/).then((context) => {
      if (newContext.tools) {
        for (const tool of newContext.tools) {
          if (tool.id) {
            this.database.toolContext.create({
              contextId: context.id,
              toolId: tool.id
            });
          }
        }
      }
      if (newContext.layers) {
        for (const layer of newContext.layers) {
          const where: any = {
            $or: [
              {id: layer.id},
              {source: JSON.stringify(layer.source)}
            ]
          };
          this.database.layer.findOne({
            where: where
          }).then((layerFound) => {
            if (layerFound) {
              this.database.layerContext.create({
                contextId: context.id,
                layerId: layerFound.id
              });
            } else {
              this.database.layer.create(layer).then((layerCreated) => {
                this.database.layerContext.create({
                  contextId: context.id,
                  layerId: layerCreated.id
                });
              });
            }
          });
        }
      }
      reply(context).code(201);
    }).catch((error) => {
      reply(Boom.badImplementation(error));
    });
  }

  public cloneContext(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['id'];
    let properties = request.payload;
    if (typeof request.payload === 'string') {
      properties = JSON.parse(request.payload);
    }
    const owner = request.headers['x-consumer-username'];

    this.database.context.findOne({
      include: [
        this.database.layer,
        this.database.tool
      ],
      where: {
        id: id
      }
    }).then((context: any) => {
      if (!context) {
        reply(Boom.notFound());
        return;
      }
      this.contextPermission.getPermissions(context, owner).subscribe(
        (permission) => {
          if (permission) {
            const plainContext = context.get();
            Object.assign(plainContext, properties);
            const newContext = {
              scope: Scope.private,
              uri: plainContext.uri,
              title: plainContext.title,
              icon: plainContext.icon,
              map: plainContext.map,
              tools: plainContext.tools,
              layers: plainContext.layers
            };
            request.payload = newContext;
            this.createContext(request, reply);
          }
        }
      );
    }).catch((error) => {
      reply(Boom.badImplementation(error));
    });
  }

  public updateContext(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['id'];
    const context = request.payload;
    const owner = request.headers['x-consumer-username'];

    this.contextPermission.getPermissionsByContextId(id, owner)
      .subscribe((permission) => {
        if (permission === TypePermission.write) {
          this.database.context.update(context, {
            where: {
              id: id
            }
          }).then((count: [number, ContextInstance[]]) => {
            if (count[0]) {
              if (context.tools) {
                this.database.toolContext.destroy({
                  where: {
                    contextId: id
                  }
                }).then(() => {
                  for (const tool of context.tools) {
                    if (tool.id) {
                      this.database.toolContext.create({
                        contextId: id,
                        toolId: tool.id
                      });
                    }
                  }
                });
              }
              if (context.layers) {
                this.database.layerContext.destroy({
                  where: {
                    contextId: id
                  }
                }).then(() => {
                  for (const layer of context.layers.reverse()) {
                    const where: any = {
                      $or: [
                        {id: layer.id},
                        {source: JSON.stringify(layer.source)}
                      ]
                    };
                    this.database.layer.findOne({
                      where: where
                    }).then((layerFound) => {
                      if (layerFound) {
                        this.database.layerContext.create({
                          contextId: id,
                          layerId: layerFound.id
                        });
                      } else {
                        this.database.layer.create(layer)
                          .then((layerCreated) => {
                            this.database.layerContext.create({
                              contextId: id,
                              layerId: layerCreated.id
                            });
                          });
                      }
                    });
                  }
                });
              }
              reply({
                id: id,
                owner: owner
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

  public deleteContext(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['id'];
    const owner = request.headers['x-consumer-username'];

    this.contextPermission.getPermissionsByContextId(id, owner)
      .subscribe((permission) => {
        if (permission === TypePermission.write) {
          this.database.context.destroy({
            where: {
              id: id
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

  public getContextById(request: Hapi.Request, reply: Hapi.IReply) {
    const owner = request.headers['x-consumer-username'];
    const id = request.params['id'];

    this.database.context.findOne({
      where: {
        id: id
      }
    }).then((context: ContextInstance) => {
      if (!context) {
        reply(Boom.notFound());
        return;
      }
      this.contextPermission.getPermissions(context, owner).subscribe(
        (permission) => {
          if (permission) {
            context.setDataValue('permission', TypePermission[permission]);
            reply(ObjectUtils.removeNull(context.get()));
          } else {
            reply(Boom.unauthorized());
          }
        }
      );
    }).catch((error) => {
      reply(Boom.badImplementation(error));
    });
  }

  public getContexts(request: Hapi.Request, reply: Hapi.IReply) {
    const owner = request.headers['x-consumer-username'];
    const isAnonyme = request.headers['x-anonymous-consumer'];
    const id = request.headers['x-consumer-id'];

    User.getProfils(id).subscribe((profils) => {
      const promises = [];
      if (owner && !isAnonyme) {
        promises.push(this.database.context.findAll({
          where: {
            owner: owner
          }
        }));
      } else {
        promises.push(new Promise(resolve => resolve()));
      }

      if (profils && profils.length) {
        promises.push(this.database.context.findAll({
          include: [{
            model: this.database.contextPermission,
            where: {
              profil: profils
            }
          }],
          where: {
            scope: 'protected',
            owner: {
              $ne: owner
            }
          }
        }));
      } else {
        promises.push(new Promise(resolve => resolve()));
      }

      promises.push(this.database.context.findAll({
        include: [{
          model: this.database.contextPermission,
          required: false,
          where: {
            profil: profils
          }
        }],
        where: {
          scope: 'public',
          owner: {
            $ne: owner
          }
        }
      }));

      Promise.all(promises)
        .then((repPromises: Array<Array<ContextInstance>>) => {
          const oursPromises = repPromises[0] || [];
          const sharedPromises = repPromises[1] || [];
          const publicPromises = repPromises[2] || [];

          const oursContexts = oursPromises.map(
            (c) => {
              const plainC = c.get();
              plainC.permission = TypePermission.write;
              return ObjectUtils.removeNull(plainC);
            }
          );
          const sharedContexts = sharedPromises.map(
            (c) => {
              const plainC = c.get();

              plainC.permission = TypePermission.read;
              for (const cp of plainC['contextPermissions']) {
                const typePerm: any = TypePermission[cp.typePermission];
                if (typePerm === TypePermission.write) {
                  plainC.permission = TypePermission.write;
                  break;
                }
              }

              delete plainC['contextPermissions'];
              return ObjectUtils.removeNull(plainC);
            }
          );
          const publicContexts = publicPromises.map(
            (c) => {
              const plainC = c.get();

              plainC.permission = TypePermission.read;
              for (const cp of plainC['contextPermissions']) {
                const typePerm: any = TypePermission[cp.typePermission];
                if (typePerm === TypePermission.write) {
                  plainC.permission = TypePermission.write;
                  break;
                }
              }

              delete plainC['contextPermissions'];
              return ObjectUtils.removeNull(plainC);
            }
          );

          const contexts = {
            ours: oursContexts,
            shared: sharedContexts,
            public: publicContexts
          };

          reply(contexts);
        }).catch((error) => {
          reply(Boom.badImplementation(error));
        });
    });
  }

  public getContextDetailsById(request: Hapi.Request, reply: Hapi.IReply) {
    const owner = request.headers['x-consumer-username'];
    const id = request.params['id'];

    this.database.context.findOne({
      include: [
        this.database.layer,
        this.database.tool
      ],
      where: {
        id: id
      }
    }).then((contextDetails: any) => {
      if (!contextDetails) {
        reply(Boom.notFound());
        return;
      }
      this.contextPermission.getPermissions(contextDetails, owner).subscribe(
        (permission) => {
          if (permission) {
            const plainDetails = contextDetails.get();
            plainDetails.permission = TypePermission[permission];
            plainDetails.layers = [];
            plainDetails.tools = [];
            plainDetails.toolbar = [];

            for (const tool of contextDetails.tools) {
              const plainTool = tool.get();
              Object.assign(plainTool.options, plainTool.toolContext.options);
              plainTool.toolContext = undefined;
              plainDetails.tools.push(plainTool);
              if (plainTool.inToolbar) {
                plainDetails.toolbar.push(plainTool.name);
              }
            }

            for (const layer of contextDetails.layers) {
              const plainLayer = layer.get();
              Object.assign(plainLayer.view, plainLayer.layerContext.view);
              Object.assign(plainLayer.source, plainLayer.layerContext.source);
              plainLayer.layerContext = undefined;
              plainDetails.layers.push(plainLayer);
            }

            reply(ObjectUtils.removeNull(plainDetails));
          } else {
            reply(Boom.unauthorized());
          }
        }
      );
    }).catch((error) => {
      reply(Boom.badImplementation(error));
    });
  }


}
