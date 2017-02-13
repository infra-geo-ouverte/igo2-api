import * as Hapi from "hapi";
import * as Boom from "boom";
import { IContext } from "./context.model";
import { IDatabase } from "../database";
import { IServerConfigurations } from "../configurations";
import {Sequelize} from "sequelize";

export default class ContextController {

    private database; //: IDatabase;
    private configs: IServerConfigurations;

    constructor(configs: IServerConfigurations, database: IDatabase) {
        this.configs = configs;
        this.database = database;
    }

    public createContext(request: Hapi.Request, reply: Hapi.IReply) {
        var newContext: IContext = request.payload;

        this.database.context.create(newContext).then((context) => {
            reply(context).code(201);
        }).catch((error) => {
            reply(Boom.badImplementation(error));
        });
    }

    public updateContext(request: Hapi.Request, reply: Hapi.IReply) {
        let id = request.params["id"];
        let context: IContext = request.payload;

        this.database.context.update(context, {
            where: {
              id: id
            }
          }).then((updatedContext: IContext) => {
              if (updatedContext) {
                  reply(updatedContext);
              } else {
                  reply(Boom.notFound());
              }
          }).catch((error) => {
              reply(Boom.badImplementation(error));
          });
    }

    public deleteContext(request: Hapi.Request, reply: Hapi.IReply) {
        let id = request.params["id"];

        this.database.context.destroy({
          where: {
            id: id
          }
        }).then((deletedContext: IContext) => {
            if (deletedContext) {
                reply(deletedContext);
            } else {
                reply(Boom.notFound());
            }
        }).catch((error) => {
            reply(Boom.badImplementation(error));
        });
    }

    public getContextById(request: Hapi.Request, reply: Hapi.IReply) {
        let id = request.params["id"];
        this.database.context.findOne({
          where: {
            id: id
          }
        }).then((context: IContext) => {
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
        this.database.context.findAll().then((contexts: Array<IContext>) => {
            reply(contexts);
        }).catch((error) => {
            reply(Boom.badImplementation(error));
        });
    }
}
