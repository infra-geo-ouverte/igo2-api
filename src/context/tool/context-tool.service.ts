import { DrizzleQueryError, and, eq } from 'drizzle-orm';

import { AppDatabase, AppInstance } from '../../app.interface';
import { IProfils, hasRequiredProfils } from '../../auth';
import { Transaction } from '../../core/database/database.interface';
import { ITool, IToolIn } from '../../tool';
import {
  IContextTool,
  IContextToolIn,
  IContextToolWithRelations
} from './context-tool.interface';
import { contextToolModel } from './context-tool.model';

export class ContextToolService {
  private db: AppDatabase;

  constructor(private app: AppInstance) {
    this.db = app.db;
  }

  async create(
    toolContext: IContextToolIn,
    transaction?: Transaction
  ): Promise<IContextTool> {
    try {
      const dbInstance = transaction || this.db;
      const [tool] = await dbInstance
        .insert(contextToolModel)
        .values(toolContext)
        .returning();
      return tool;
    } catch (error) {
      if (error instanceof DrizzleQueryError) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const code = (error?.cause as any)?.code;
        if (code === '23505') {
          const message = 'The pair contextId and toolId must be unique.';
          throw this.app.httpErrors.conflict(message);
        }
      }
      throw error;
    }
  }

  async update(
    contextId: number,
    toolId: number,
    toolContext: IContextToolIn
  ): Promise<IContextTool> {
    const [tool] = await this.db
      .update(contextToolModel)
      .set(toolContext)
      .where(
        and(
          eq(contextToolModel.toolId, toolId),
          eq(contextToolModel.contextId, contextId)
        )
      )
      .returning();
    return tool;
  }

  async cloneByContextId(
    fromId: number,
    toId: number,
    transaction: Transaction
  ): Promise<IContextTool[]> {
    const tools = await this.getByContextId(fromId);
    const requests$ = tools.map(({ id: _id, ...tool }) =>
      this.create({ ...tool, contextId: toId }, transaction)
    );
    return Promise.all(requests$);
  }

  async delete(contextId: number, toolId: number): Promise<number> {
    const result = await this.db
      .delete(contextToolModel)
      .where(
        and(
          eq(contextToolModel.toolId, toolId),
          eq(contextToolModel.contextId, contextId)
        )
      );
    return result.rowCount ?? 0;
  }

  async deleteByContextId(
    contextId: number,
    transaction: Transaction
  ): Promise<number> {
    const dbInstance = transaction || this.db;
    const result = await dbInstance
      .delete(contextToolModel)
      .where(eq(contextToolModel.contextId, contextId));
    return result.rowCount ?? 0;
  }

  async getByContextId(contextId: number): Promise<IContextTool[]> {
    const tools = await this.db
      .select()
      .from(contextToolModel)
      .where(eq(contextToolModel.contextId, contextId));

    return tools;
  }

  async getById(
    contextId: number,
    toolId: number
  ): Promise<IContextTool | undefined> {
    const [tool] = await this.db
      .select()
      .from(contextToolModel)
      .where(
        and(
          eq(contextToolModel.toolId, toolId),
          eq(contextToolModel.contextId, contextId)
        )
      );

    return tool;
  }

  async bulkCreate(
    contextId: number,
    tools: Omit<IToolIn, 'toolId'>[],
    transaction?: Transaction
  ) {
    const promises = [];

    for (const tool of tools) {
      if (tool.id && !tool.global) {
        promises.push(
          this.create(
            {
              contextId,
              toolId: tool.id
            },
            transaction
          )
            .then((rep) => {
              return { toolId: rep.toolId };
            })
            .catch((error) => {
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

  formatTools(
    contextTools: IContextToolWithRelations[],
    profils: IProfils,
    globalTools?: ITool[]
  ): [string[], ITool[]] {
    const toolbar: ITool[] = [];
    const tools: ITool[] = [];

    const toolsFiltered = contextTools.filter((ctxTool) =>
      hasRequiredProfils(ctxTool.tool?.profils, profils)
    );

    for (const ctxTool of toolsFiltered) {
      const tool = {
        ...ctxTool.tool!,
        options: {
          ...ctxTool.tool!.options,
          ...ctxTool.options
        }
      };

      tools.push(tool);
      if (tool.inToolbar) {
        toolbar.push(tool);
      }
    }

    if (globalTools) {
      const filteredTools = globalTools.filter((tool) =>
        hasRequiredProfils(tool.profils, profils)
      );
      for (const tool of filteredTools) {
        const { profils: _p, ...restTool } = tool;
        const normalizedTool = { profils, ...restTool };

        const isAlreadyAdded = tools.some(
          (t) => t.name === normalizedTool.name
        );

        if (!isAlreadyAdded) {
          tools.push(normalizedTool);

          if (normalizedTool.inToolbar) {
            toolbar.push(normalizedTool);
          }
        }
      }
    }

    const toolbarName = toolbar
      .sort((t1, t2) => (t1.order ?? 0) - (t2.order ?? 0))
      .map((t) => t.name)
      .filter((name): name is string => name !== null);
    return [toolbarName, tools];
  }
}
