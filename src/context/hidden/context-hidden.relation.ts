import { defineRelationsPart } from 'drizzle-orm';

import { userModel } from '../../user/user.model';
import { contextModel } from '../context.model';
import { contextHiddenModel } from './context-hidden.model';

export const contextHiddenRelations = defineRelationsPart(
  { contextHidden: contextHiddenModel, context: contextModel, user: userModel },
  (r) => ({
    contextHidden: {
      context: r.one.context({
        from: r.contextHidden.contextId,
        to: r.context.id
      }),
      user: r.one.user({
        from: r.contextHidden.userId,
        to: r.user.id
      })
    }
  })
);
