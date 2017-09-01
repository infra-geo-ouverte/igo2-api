import * as Hapi from 'hapi';
import * as Boom from 'boom';

import { IDatabase, database } from '../database';
import { ObjectUtils, uuid } from '../utils';

import { User } from '../user';
import { TypePermission, ContextPermission } from '../contextPermission';
import { ToolContext } from '../toolContext';
import { LayerContext } from '../layerContext';

import { Context, ContextInstance, Scope } from './index';


export class ContextController {

  private database: IDatabase = database;
  private context: Context;
  private contextPermission: ContextPermission;
  private toolContext: ToolContext;
  private layerContext: LayerContext;

  constructor() {
    this.contextPermission = new ContextPermission();
    this.context = new Context();
    this.toolContext = new ToolContext();
    this.layerContext = new LayerContext();
  }

  public create(request: Hapi.Request, reply: Hapi.IReply) {
    const newContext = request.payload;
    newContext.owner = request.headers['x-consumer-username'];

    this.context.create(newContext).subscribe(
      (context: ContextInstance) => {
        if (newContext.tools) {
          this.toolContext.bulkCreate(context.id, newContext.tools)
            .subscribe(
              () => {
                newContext.tools = undefined;
                if (!newContext.layers) {
                  reply(context).code(201);
                }
              },
              (error) => {
                newContext.tools = undefined;
                if (!newContext.layers) {
                  reply(context).code(201);
                }
              }
            );
        }
        if (newContext.layers) {
          this.layerContext.bulkCreate(context.id, newContext.layers, true)
            .subscribe(
              () => {
                newContext.layers = undefined;
                if (!newContext.tools) {
                  reply(context).code(201);
                }
              },
              (error) => {
                newContext.layers = undefined;
                if (!newContext.tools) {
                  reply(context).code(201);
                }
              }
            );
        }

        if (!newContext.tools && !newContext.layers) {
          reply(context).code(201);
        }

      },
      (error: Boom.BoomError) => reply(error)
    );
  }

  public clone(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['contextId'];
    let properties = request.payload;
    if (typeof request.payload === 'string') {
      properties = JSON.parse(request.payload);
    }

    this.context.getById(id, true, true).subscribe(
      (context: any) => {
        Object.assign(context, properties);
        const newContext = {
          scope: Scope[Scope.private],
          uri: uuid(),
          title: context.title,
          icon: context.icon,
          map: context.map,
          tools: context.tools,
          layers: context.layers
        };
        request.payload = newContext;
        this.create(request, reply);
      },
      (error: Boom.BoomError) => reply(error)
    );
  }

  public update(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['contextId'];
    const newContext = request.payload;

    this.context.update(id, newContext).subscribe(
      (context: ContextInstance) => {

        if (newContext.tools) {
          this.toolContext.deleteByContextId(context.id).subscribe(
            (rep) => {
              this.toolContext.bulkCreate(context.id, newContext.tools)
                .subscribe(
                  () => {
                    newContext.tools = undefined;
                    if (!newContext.layers) {
                      reply(context);
                    }
                  },
                  (error) => {
                    newContext.tools = undefined;
                    if (!newContext.layers) {
                      reply(context);
                    }
                  }
                );
            },
            (error: Boom.BoomError) => reply(error)
          );
        }
        if (newContext.layers) {
          this.layerContext.deleteByContextId(context.id).subscribe(
            (rep) => {
              this.layerContext.bulkCreate(context.id, newContext.layers, true)
                .subscribe(
                  () => {
                    newContext.layers = undefined;
                    if (!newContext.tools) {
                      reply(context);
                    }
                  },
                  (error) => {
                    newContext.layers = undefined;
                    if (!newContext.tools) {
                      reply(context);
                    }
                  }
                );
            },
            (error: Boom.BoomError) => reply(error)
          );
        }

        if (!newContext.tools && !newContext.layer) {
          reply(context);
        }

      },
      (error: Boom.BoomError) => reply(error)
    );
  }

  public delete(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['contextId'];
    this.context.delete(id).subscribe(
      (context: ContextInstance) => reply(context).code(204),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public getById(request: Hapi.Request, reply: Hapi.IReply) {
    const owner = request.headers['x-consumer-username'];
    const id = request.params['contextId'];

    this.context.getById(id).subscribe(
      (context: ContextInstance) => {
        this.contextPermission.getPermission(context, owner).subscribe(
          (permission) => {
            if (permission) {
              context.permission = TypePermission[permission];
              reply(context);
            } else {
              reply(Boom.unauthorized());
            }
          }
        );
      },
      (error: Boom.BoomError) => reply(error)
    );
  }

  public get(request: Hapi.Request, reply: Hapi.IReply) {
    const owner = request.headers['x-consumer-username'];
    const isAnonyme = request.headers['x-anonymous-consumer'];
    const id = request.headers['x-consumer-id'];

    User.getProfils(id).subscribe((profils) => {
      profils = profils || [];
      if (owner) {
        profils.push(owner);
      }

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
              plainC.permission = TypePermission[TypePermission.write];
              return ObjectUtils.removeNull(plainC);
            }
          );
          const sharedContexts = sharedPromises.map(
            (c) => {
              const plainC = c.get();

              plainC.permission = TypePermission[TypePermission.read];
              for (const cp of plainC['contextPermissions']) {
                const typePerm: any = cp.typePermission;
                if (typePerm === TypePermission[TypePermission.write]) {
                  plainC.permission = TypePermission[TypePermission.write];
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
              plainC.permission = TypePermission[TypePermission.read];
              for (const cp of plainC['contextPermissions']) {
                const typePerm: any = cp.typePermission;
                if (typePerm === TypePermission[TypePermission.write]) {
                  plainC.permission = TypePermission[TypePermission.write];
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

  public getDetailsById(request: Hapi.Request, reply: Hapi.IReply) {
    const owner = request.headers['x-consumer-username'];
    const id = request.params['contextId'];

    this.context.getById(id, true, true).subscribe((contextDetails: any) => {
      this.contextPermission.getPermission(contextDetails, owner).subscribe(
        (permission) => {
          if (permission) {
            contextDetails.permission = TypePermission[permission];
            reply(contextDetails);
          } else {
            reply(Boom.unauthorized());
          }
        },
        (error: Boom.BoomError) => reply(error)
      );
    });
  }

}
