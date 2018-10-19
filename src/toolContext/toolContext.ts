import * as Boom from 'boom';

import { IDatabase, database } from '../database';
import { ObjectUtils } from '../utils';

import { IToolContext, ToolContextInstance } from './toolContext.model';

export class ToolContext {
  private database: IDatabase = database;

  constructor() {}

  public async create(toolContext: IToolContext): Promise<ToolContextInstance> {
    return await this.database.toolContext.create(toolContext).catch(error => {
      const uniqueFields = ['contextId', 'toolId'];
      if (
        error.name === 'SequelizeUniqueConstraintError' &&
        Object.keys(error.fields) === uniqueFields
      ) {
        const message = 'The pair contextId and toolId must be unique.';
        throw Boom.conflict(message);
      }
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        const message = 'Tool can not be found.';
        throw Boom.badRequest(message);
      }

      throw Boom.badImplementation(error);
    });
  }

  public async update(
    contextId: string,
    toolId: string,
    toolContext: IToolContext
  ): Promise<IToolContext> {
    return await this.database.toolContext
      .update(toolContext, {
        where: {
          toolId: toolId,
          contextId: contextId
        }
      })
      .then((count: [number, ToolContextInstance[]]) => {
        if (!count[0]) {
          throw Boom.notFound();
        }
        return {
          toolId: toolId,
          contextId: contextId
        };
      });
  }

  public async delete(contextId: string, toolId: string): Promise<void> {
    return await this.database.toolContext
      .destroy({
        where: {
          toolId: toolId,
          contextId: contextId
        }
      })
      .then((count: number) => {
        if (!count) {
          throw Boom.notFound();
        }
        return;
      });
  }

  public async deleteByContextId(contextId: string): Promise<void> {
    return await this.database.toolContext
      .destroy({
        where: {
          contextId: contextId
        }
      })
      .then((count: number) => {
        if (!count) {
          throw Boom.notFound();
        }
        return;
      });
  }

  public async getByContextId(
    contextId: string
  ): Promise<ToolContextInstance[]> {
    return await this.database.toolContext
      .findAll({
        where: {
          contextId: contextId
        }
      })
      .then((toolContextsContexts: ToolContextInstance[]) => {
        const plainToolContextsContexts = toolContextsContexts.map(
          toolContext => ObjectUtils.removeNull(toolContext.get())
        );
        return plainToolContextsContexts;
      });
  }

  public async getById(
    contextId: string,
    toolId: string
  ): Promise<ToolContextInstance> {
    return await this.database.toolContext
      .findOne({
        where: {
          toolId: toolId,
          contextId: contextId
        }
      })
      .then((toolContext: ToolContextInstance) => {
        if (!toolContext) {
          throw Boom.notFound();
        }
        return ObjectUtils.removeNull(toolContext.get());
      });
  }

  public async bulkCreate(
    contextId: string,
    tools: IToolContext[],
    ignoreErrors = true
  ) {
    const promises = [];

    for (const tool of tools) {
      if (tool.id) {
        promises.push(
          this.create({
            contextId: contextId,
            toolId: tool.id
          })
            .then(rep => {
              return { toolId: rep.toolId };
            })
            .catch(error => {
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
