import * as Boom from '@hapi/boom';

import { ObjectUtils } from '@igo2/base-api';

import { ITool } from './tool.interface';
import { Tool } from './tool.model';

export class ToolService {
  public async create(tool: ITool): Promise<Tool> {
    return await Tool.create(tool).catch((error) => {
      if (error?.data?.name === 'SequelizeUniqueConstraintError') {
        const message = 'The pair contextId and toolId must be unique.';
        throw Boom.conflict(message);
      }
      if (Boom.isBoom(error)) {
        throw error;
      }
      throw Boom.badImplementation(error);
    });
  }

  public async update(id: string, tool: ITool): Promise<{ id: string }> {
    return await Tool.update(tool, {
      where: {
        id: id
      }
    }).then((count: [number, Tool[]]) => {
      if (!count[0]) {
        throw Boom.notFound();
      }
      return { id: id };
    });
  }

  public async delete(id: string): Promise<void> {
    return await Tool.destroy({
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

  public async get(): Promise<Tool[]> {
    return await Tool.findAll().then((tools: Tool[]) => {
      const plainTools = tools.map((tool) => ObjectUtils.removeNull(tool.get()));
      return plainTools;
    });
  }

  public async getById(id: string): Promise<Tool> {
    return await Tool.findOne({
      where: {
        id: id
      }
    }).then((tool: Tool) => {
      if (!tool) {
        throw Boom.notFound();
      }
      return ObjectUtils.removeNull(tool.get());
    });
  }
}
