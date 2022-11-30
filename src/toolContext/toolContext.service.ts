import * as Boom from '@hapi/boom';

import { ObjectUtils } from '@igo2/base-api';

import { IToolContext } from './toolContext.interface';
import { ToolContext } from './toolContext.model';

export class ToolContextService {
  public async create (toolContext: IToolContext): Promise<ToolContext> {
    return await ToolContext.create(toolContext).catch((error) => {
      if (error?.data?.name === 'SequelizeUniqueConstraintError') {
        const message = 'The pair contextId and toolId must be unique.';
        throw Boom.conflict(message);
      }
      if (error?.data?.name === 'SequelizeForeignKeyConstraintError') {
        const message = 'Tool can not be found.';
        throw Boom.badRequest(message);
      }
      if (Boom.isBoom(error)) {
        throw error;
      }
      throw Boom.badImplementation(error);
    });
  }

  public async update (contextId: string, toolId: string, toolContext: IToolContext): Promise<IToolContext> {
    return await ToolContext.update(toolContext, {
      where: {
        toolId: toolId,
        contextId: contextId
      }
    }).then((count: [number]) => {
      if (!count[0]) {
        throw Boom.notFound();
      }
      return {
        toolId: toolId,
        contextId: contextId
      };
    });
  }

  public async delete (contextId: string, toolId: string): Promise<void> {
    return await ToolContext.destroy({
      where: {
        toolId: toolId,
        contextId: contextId
      }
    }).then((count: number) => {
      if (!count) {
        throw Boom.notFound();
      }
    });
  }

  public async deleteByContextId (contextId: string): Promise<void> {
    return await ToolContext.destroy({
      where: {
        contextId: contextId
      }
    }).then((count: number) => {
      if (!count) {
        throw Boom.notFound();
      }
    });
  }

  public async getByContextId (contextId: string): Promise<ToolContext[]> {
    return await ToolContext.findAll({
      where: {
        contextId: contextId
      }
    }).then((toolContextsContexts: ToolContext[]) => {
      const plainToolContextsContexts = toolContextsContexts.map((toolContext) =>
        ObjectUtils.removeNull(toolContext.get())
      );
      return plainToolContextsContexts;
    });
  }

  public async getById (contextId: string, toolId: string): Promise<ToolContext> {
    return await ToolContext.findOne({
      where: {
        toolId: toolId,
        contextId: contextId
      }
    }).then((toolContext: ToolContext) => {
      if (!toolContext) {
        throw Boom.notFound();
      }
      return ObjectUtils.removeNull(toolContext.get());
    });
  }

  public async bulkCreate (contextId: string, tools: IToolContext[], ignoreErrors = true) {
    const promises = [];

    for (const tool of tools) {
      if (tool.id && !tool.global) {
        promises.push(
          this.create({
            contextId: contextId,
            toolId: tool.id
          })
            .then((rep) => {
              return { toolId: rep.toolId };
            })
            .catch((error) => {
              if (!ignoreErrors) {
                throw error;
              }
              return {
                toolId: tool.id,
                error: error
              };
            })
        );
      }
    }

    return await Promise.all(promises);
  }
}
