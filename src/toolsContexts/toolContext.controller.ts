import * as Hapi from 'hapi';
import * as Boom from 'boom';
import { IToolContext, ToolContextInstance } from './toolContext.model';
import { IDatabase } from '../database';
import { IServerConfigurations } from '../configurations';

export default class ToolContextController {

  private database: IDatabase;
  private configs: IServerConfigurations;

  constructor(configs: IServerConfigurations, database: IDatabase) {
    this.configs = configs;
    this.database = database;
  }

  public createToolContext(request: Hapi.Request, reply: Hapi.IReply) {
    const newToolContext: IToolContext = request.payload;
    this.database.toolContext.create(newToolContext)
      .then((toolContext) => {
        reply(toolContext).code(201);
      }).catch((error) => {
        reply(Boom.badImplementation(error));
      });
  }

  public updateToolContext(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['id'];
    const toolContext: IToolContext = request.payload;

    this.database.toolContext.update(toolContext, {
      where: {
        id: id
      }
    }).then((count: [number, ToolContextInstance[]]) => {
      if (count[0]) {
        reply({});
      } else {
        reply(Boom.notFound());
      }
    }).catch((error) => {
      reply(Boom.badImplementation(error));
    });
  }

  public deleteToolContext(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['id'];
    this.database.toolContext.destroy({
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

  public getToolContextById(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['id'];
    this.database.toolContext.findOne({
      where: {
        id: id
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
  }

  public gettoolsContexts(request: Hapi.Request, reply: Hapi.IReply) {
    this.database.toolContext.findAll()
      .then((toolsContexts: Array<ToolContextInstance>) => {
        reply(toolsContexts);
      }).catch((error) => {
        reply(Boom.badImplementation(error));
      });
  }


  public getToolsByContextId(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['id'];



    this.database.context.findAll({
      include: [ this.database.tool ],
      where: {
        id: id
      }
    }).then((toolsContexts: Array<any>) => {
      reply(toolsContexts);
    }).catch((error) => {
      reply(Boom.badImplementation(error));
    });
  }

}
