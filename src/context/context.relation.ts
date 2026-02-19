import { defineRelationsPart } from 'drizzle-orm';

import { userModel } from '../user/user.model';
import { contextAccessModel } from './access/context-access.model';
import { contextModel } from './context.model';
import { contextHiddenModel } from './hidden/context-hidden.model';
import { contextLayerModel } from './layer/context-layer.model';
import { contextPermissionModel } from './permission/context-permission.model';
import { contextToolModel } from './tool/context-tool.model';

export const contextRelations = defineRelationsPart(
  {
    context: contextModel,
    user: userModel,
    contextLayer: contextLayerModel,
    contextTool: contextToolModel,
    contextPermission: contextPermissionModel,
    contextHidden: contextHiddenModel,
    contextAccess: contextAccessModel
  },
  (r) => ({
    context: {
      user: r.one.user({
        from: r.context.userId,
        to: r.user.id,
        optional: true
      }),
      contextAccesses: r.many.contextAccess({
        from: r.context.id,
        to: r.contextAccess.contextId
      }),
      contextHiddens: r.many.contextHidden({
        from: r.context.id,
        to: r.contextHidden.contextId
      }),
      contextLayers: r.many.contextLayer({
        from: r.context.id,
        to: r.contextLayer.contextId
      }),
      contextPermissions: r.many.contextPermission({
        from: r.context.id,
        to: r.contextPermission.contextId
      }),
      contextTools: r.many.contextTool({
        from: r.context.id,
        to: r.contextTool.contextId
      })
    }
  })
);
