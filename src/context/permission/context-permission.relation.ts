import { defineRelationsPart } from 'drizzle-orm';

import { profilModel } from '../../profil/profil.model';
import { userModel } from '../../user/user.model';
import { contextModel } from '../context.model';
import { contextPermissionModel } from './context-permission.model';

export const contextPermissionRelations = defineRelationsPart(
  {
    contextPermission: contextPermissionModel,
    context: contextModel,
    user: userModel,
    profil: profilModel
  },
  (r) => ({
    contextPermission: {
      context: r.one.context({
        from: r.contextPermission.contextId,
        to: r.context.id
      }),
      user: r.one.user({
        from: r.contextPermission.userId,
        to: r.user.id
      }),
      profil: r.one.profil({
        from: r.contextPermission.profilId,
        to: r.profil.id
      })
    }
  })
);
