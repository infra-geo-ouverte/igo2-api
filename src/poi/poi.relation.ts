import { defineRelationsPart } from 'drizzle-orm';

import { userModel } from '../user';
import { poiModel } from './poi.model';

export const poiRelations = defineRelationsPart(
  { poi: poiModel, user: userModel },
  (r) => ({
    poi: {
      user: r.one.user({
        from: r.poi.userId,
        to: r.user.id
      })
    }
  })
);
