import * as Boom from 'boom';

import { IDatabase, database } from '../database';
import { ObjectUtils } from '../utils';

import { ITool, ToolInstance } from './tool.model';

export class Tool {

  private database: IDatabase = database;

  constructor() { }

  public async create(tool: ITool): Promise<ToolInstance> {
    return await this.database.tool.create(tool);
  }

  public async update(id: string, tool: ITool): Promise<{ id: string }> {
    return await this.database.tool.update(tool, {
      where: {
        id: id
      }
    }).then((count: [number, ToolInstance[]]) => {
      if (!count[0]) {
        throw Boom.notFound();
      }
      return { id: id };
    });
  }

  public async delete(id: string): Promise<void> {
    return await this.database.tool.destroy({
      where: {
        id: id
      }
    }).then((count: number) => {
      if (!count) {
        throw Boom.notFound();
      }
      return;
    });
  }

  public async get(): Promise<ToolInstance[]> {
    return await this.database.tool.findAll().then((tools: ToolInstance[]) => {
      const plainTools = tools.map(
        (tool) => ObjectUtils.removeNull(tool.get())
      );
      return plainTools;
    });
  }

  public async getById(id: string): Promise<ToolInstance> {
    return await this.database.tool.findOne({
      where: {
        id: id
      }
    }).then((tool: ToolInstance) => {
      if (!tool) {
        throw Boom.notFound();
      }
      return ObjectUtils.removeNull(tool.get());
    });
  }

}
