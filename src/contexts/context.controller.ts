import * as Hapi from 'hapi';
import * as Boom from 'boom';
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
        this.database.context.findAll()
        .then((contexts: Array<ContextInstance>) => {
            reply(contexts);
        }).catch((error) => {
            reply(Boom.badImplementation(error));
        });
    }

    public getContextDetailsById(request: Hapi.Request, reply: Hapi.IReply) {
      const id = request.params['id'];

      this.database.context.findAll({
        include: [
          this.database.layer,
          this.database.tool
        ],
        where: {
          id: id
        }
      }).then((layersContexts: Array<any>) => {
        reply(layersContexts);
      }).catch((error) => {
        reply(Boom.badImplementation(error));
      });
    }

}
