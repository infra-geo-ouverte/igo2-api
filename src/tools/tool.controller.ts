import * as Hapi from 'hapi';
import * as Boom from 'boom';

import { IDatabase } from '../database';
import { IServerConfiguration } from '../configurations';

import { ObjectUtils } from '../utils';
import { User } from '../users';
import { ITool, ToolInstance } from './tool.model';

export default class ToolController {

  private database: IDatabase;
  private configs: IServerConfiguration;

  constructor(configs: IServerConfiguration, database: IDatabase) {
    this.configs = configs;
    this.database = database;
  }

  public createTool(request: Hapi.Request, reply: Hapi.IReply) {
    const newTool: ITool = request.payload;
    const idUser = request.headers['x-consumer-id'];

    User.getProfils(idUser).subscribe((profils) => {
      if (profils.includes(this.configs.adminProfil)) {
        this.database.tool.create(newTool).then((tool) => {
          reply(tool).code(201);
        }).catch((error) => {
          reply(Boom.badImplementation(error));
        });
      } else {
        reply(Boom.unauthorized());
      }
    });
  }

  public updateTool(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['id'];
    const tool: ITool = request.payload;
    const idUser = request.headers['x-consumer-id'];

    User.getProfils(idUser).subscribe((profils) => {
      if (profils.includes(this.configs.adminProfil)) {
        this.database.tool.update(tool, {
          where: {
            id: id
          }
        }).then((count: [number, ToolInstance[]]) => {
          if (count[0]) {
            reply({
              id: id
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

  public deleteTool(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['id'];
    const idUser = request.headers['x-consumer-id'];

    User.getProfils(idUser).subscribe((profils) => {
      if (profils.includes(this.configs.adminProfil)) {
        this.database.tool.destroy({
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

  public getToolById(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['id'];
    const idUser = request.headers['x-consumer-id'];

    User.getProfils(idUser).subscribe((profils) => {
      if (profils.includes(this.configs.adminProfil)) {
        this.database.tool.findOne({
          where: {
            id: id
          }
        }).then((tool: ToolInstance) => {
          if (tool) {
            reply(ObjectUtils.removeNull(tool.get()));
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

  public getTools(request: Hapi.Request, reply: Hapi.IReply) {
    const idUser = request.headers['x-consumer-id'];

    User.getProfils(idUser).subscribe((profils) => {
      if (profils.includes(this.configs.adminProfil)) {
        this.database.tool.findAll()
          .then((tools: Array<ToolInstance>) => {
            const plainTools = tools.map(
              (tool) => ObjectUtils.removeNull(tool.get())
            );
            reply(plainTools);
          }).catch((error) => {
            reply(Boom.badImplementation(error));
          });
      } else {
        reply(Boom.unauthorized());
      }
    });
  }
}
