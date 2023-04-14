import * as Boom from '@hapi/boom';

import { ObjectUtils } from '@igo2/base-api';
import { UserApi } from '../user';
import { ITool } from './tool.interface';
import { Tool } from './tool.model';

export class ToolService {
  public async create (tool: ITool): Promise<Tool> {
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

  public async update (id: string, tool: ITool): Promise<{ id: string }> {
    return await Tool.update(tool, {
      where: {
        id
      }
    }).then((count: [number]) => {
      if (!count[0]) {
        throw Boom.notFound();
      }
      return { id };
    });
  }

  public async delete (id: string): Promise<void> {
    return await Tool.destroy({
      where: {
        id
      }
    }).then((count: number) => {
      if (!count) {
        throw Boom.notFound();
      }
    });
  }

  public async get (userId: string): Promise<Tool[]> {
    const profils: string[] = await UserApi.getProfils(userId).catch(() => {
      return [];
    });
    profils.push(userId);

    return await Tool.findAll().then((tools: Tool[]) => {
      const plainTools = tools.filter(t => {
        return t.profils.length === 0 || t.profils.some(p => profils.includes(p));
      }).map((tool) => ObjectUtils.removeNull(tool.get()));
      return plainTools;
    });
  }

  public async getById (id: string, userId: string): Promise<Tool> {
    const profils: string[] = await UserApi.getProfils(userId).catch(() => {
      return [];
    });
    profils.push(userId);

    return await Tool.findOne({
      where: {
        id
      }
    }).then((tool: Tool) => {
      if (!tool || (tool.profils.length !== 0 && !tool.profils.some(p => profils.includes(p)))) {
        throw Boom.notFound();
      }

      return ObjectUtils.removeNull(tool.get());
    });
  }
}
