import { defineRelationsPart } from 'drizzle-orm';

import { contextModel } from '../context/context.model';
import { contextHiddenModel } from '../context/hidden/context-hidden.model';
import { contextPermissionModel } from '../context/permission/context-permission.model';
import { poiModel } from '../poi/poi.model';
import { userModel } from './user.model';

export const userRelations = defineRelationsPart(
  {
    user: userModel,
    context: contextModel,
    contextPermission: contextPermissionModel,
    contextHidden: contextHiddenModel,
    poi: poiModel
  },
  (r) => ({
    user: {
      contexts: r.many.context({
        from: r.user.id,
        to: r.context.userId
      }),
      // contextPermissions: r.many.contextPermission(),
      // contextHiddens: r.many.contextHidden(),
      pois: r.many.poi({
        from: r.user.id,
        to: r.poi.userId
      })
    }
  })
);
