import * as Hapi from 'hapi';
import * as Boom from 'boom';
import { ITool, ToolInstance } from './tool.model';
import { IDatabase } from '../database';
import { IServerConfigurations } from '../configurations';

export default class ToolController {

    private database: IDatabase;
    private configs: IServerConfigurations;

    constructor(configs: IServerConfigurations, database: IDatabase) {
        this.configs = configs;
        this.database = database;
    }

    public createTool(request: Hapi.Request, reply: Hapi.IReply) {
        const newTool: ITool = request.payload;
        this.database.tool.create(newTool).then((tool) => {
            reply(tool).code(201);
        }).catch((error) => {
            reply(Boom.badImplementation(error));
        });
    }

    public updateTool(request: Hapi.Request, reply: Hapi.IReply) {
        const id = request.params['id'];
        const tool: ITool = request.payload;

        this.database.tool.update(tool, {
            where: {
              id: id
            }
          }).then((count: [number, ToolInstance[]]) => {
              if (count[0]) {
                  reply({});
              } else {
                  reply(Boom.notFound());
              }
          }).catch((error) => {
              reply(Boom.badImplementation(error));
        });
    }

    public deleteTool(request: Hapi.Request, reply: Hapi.IReply) {
      const id = request.params['id'];
      this.database.tool.destroy({
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

    public getToolById(request: Hapi.Request, reply: Hapi.IReply) {
        const id = request.params['id'];
        this.database.tool.findOne({
          where: {
            id: id
          }
        }).then((tool: ToolInstance) => {
            if (tool) {
                reply(tool);
            } else {
                reply(Boom.notFound());
            }
        }).catch((error) => {
            reply(Boom.badImplementation(error));
        });
    }

    public getTools(request: Hapi.Request, reply: Hapi.IReply) {
        this.database.tool.findAll()
        .then((tools: Array<ToolInstance>) => {
            reply(tools);
        }).catch((error) => {
            reply(Boom.badImplementation(error));
        });
    }
}
