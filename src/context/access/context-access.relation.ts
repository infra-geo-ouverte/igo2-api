import { defineRelationsPart } from 'drizzle-orm';

import { contextModel } from '../context.model';
import { contextAccessModel } from './context-access.model';

export const contextAccessRelations = defineRelationsPart(
  { contextAccess: contextAccessModel, context: contextModel },
  (r) => ({
    contextAccess: {
      context: r.one.context({
        from: r.contextAccess.contextId,
        to: r.context.id
      })
    }
  })
);
