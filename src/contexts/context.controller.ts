import * as Hapi from 'hapi';
import * as Boom from 'boom';
import { User } from '../users';
import { IContext, ContextInstance } from './context.model';
import { IDatabase } from '../database';
import { IServerConfigurations } from '../configurations';

export default class ContextController {

    private database: IDatabase;
    private configs: IServerConfigurations;

    constructor(configs: IServerConfigurations, database: IDatabase) {
        this.configs = configs;
        this.database = database;
    }

    public createContext(request: Hapi.Request, reply: Hapi.IReply) {
        const newContext: IContext = request.payload;

        newContext.owner = request.headers['x-consumer-username'];

        this.database.context.create(newContext).then((context) => {
            reply(context).code(201);
        }).catch((error) => {
            reply(Boom.badImplementation(error));
        });
    }

    public updateContext(request: Hapi.Request, reply: Hapi.IReply) {
        const id = request.params['id'];
        const context: IContext = request.payload;

        this.database.context.update(context, {
            where: {
              id: id
            }
          }).then((count: [number, ContextInstance[]]) => {
              if (count[0]) {
                  reply({});
              } else {
                  reply(Boom.notFound());
              }
          }).catch((error) => {
              reply(Boom.badImplementation(error));
        });
    }

    public deleteContext(request: Hapi.Request, reply: Hapi.IReply) {
      const id = request.params['id'];
      this.database.context.destroy({
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

    public getContextById(request: Hapi.Request, reply: Hapi.IReply) {
        // TODO : verify permissions
        const id = request.params['id'];
        this.database.context.findOne({
          where: {
            id: id
          }
        }).then((context: ContextInstance) => {
            if (context) {
                reply(context);
            } else {
                reply(Boom.notFound());
            }
        }).catch((error) => {
            reply(Boom.badImplementation(error));
        });
    }

    public getContexts(request: Hapi.Request, reply: Hapi.IReply) {
        const owner = request.headers['x-consumer-username'];
        const id = request.headers['x-consumer-id'];

        User.getProfils(id).subscribe((profils) => {
          const promises = [];

          promises.push(this.database.context.findAll({
            where: {
              owner: owner
            }
          }));

          // TODO: promises where user has permission in contextPermission
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

          promises.push(this.database.context.findAll({
            where: {
              scope: 'public',
              owner: {
                $ne: owner
              }
            }
          }));

          Promise.all(promises)
          .then((repPromises: Array<Array<ContextInstance>>) => {
              const contexts = {
                ours: repPromises[0],
                shared: repPromises[1],
                public: repPromises[2]
              };
              reply(contexts);
          }).catch((error) => {
              reply(Boom.badImplementation(error));
          });
        });
    }

    public getContextDetailsById(request: Hapi.Request, reply: Hapi.IReply) {
      // TODO : verify permissions
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
        const plainDetails = contextDetails.get();
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

        reply(plainDetails);
      }).catch((error) => {
        reply(Boom.badImplementation(error));
      });
    }

}
