import { defineRelationsPart } from 'drizzle-orm';

import { toolModel } from '../../tool';
import { contextModel } from '../context.model';
import { contextToolModel } from './context-tool.model';

export const contextToolRelations = defineRelationsPart(
  { contextTool: contextToolModel, context: contextModel, tool: toolModel },
  (r) => ({
    contextTool: {
      context: r.one.context({
        from: r.contextTool.contextId,
        to: r.context.id
      }),
      tool: r.one.tool({
        from: r.contextTool.toolId,
        to: r.tool.id
      })
    }
  })
);
