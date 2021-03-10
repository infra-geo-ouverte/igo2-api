import * as Boom from 'boom';

import { IDatabase, database, ObjectUtils } from '@igo2/base-api';

import { ITool, ToolInstance } from './tool.model';

export class Tool {
  private database: IDatabase = database;

  constructor() {}

  public async create(tool: ITool): Promise<ToolInstance> {
    return await this.database.models.tool.create(tool).catch(error => {
      if (error.name === 'SequelizeUniqueConstraintError') {
        const message = 'The pair contextId and toolId must be unique.';
        throw Boom.conflict(message);
      }

      throw Boom.badImplementation(error);
    });
  }

  public async update(id: string, tool: ITool): Promise<{ id: string }> {
    return await this.database.models.tool
      .update(tool, {
        where: {
          id: id
        }
      })
      .then((count: [number, ToolInstance[]]) => {
        if (!count[0]) {
          throw Boom.notFound();
        }
        return { id: id };
      });
  }

  public async delete(id: string): Promise<void> {
    return await this.database.models.tool
      .destroy({
        where: {
          id: id
        }
      })
      .then((count: number) => {
        if (!count) {
          throw Boom.notFound();
        }
        return;
      });
  }

  public async get(): Promise<ToolInstance[]> {
    return await this.database.models.tool.findAll().then((tools: ToolInstance[]) => {
      const plainTools = tools.map(tool => ObjectUtils.removeNull(tool.get()));
      return plainTools;
    });
  }

  public async getById(id: string): Promise<ToolInstance> {
    return await this.database.models.tool
      .findOne({
        where: {
          id: id
        }
      })
      .then((tool: ToolInstance) => {
        if (!tool) {
          throw Boom.notFound();
        }
        return ObjectUtils.removeNull(tool.get());
      });
  }
}
