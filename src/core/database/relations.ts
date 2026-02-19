import { defineRelationsPart } from 'drizzle-orm';

import { contextAccessRelations } from '../../context/access/context-access.relation';
import { contextRelations } from '../../context/context.relation';
import { contextHiddenRelations } from '../../context/hidden/context-hidden.relation';
import { contextLayerRelations } from '../../context/layer/context-layer.relation';
import { contextPermissionRelations } from '../../context/permission/context-permission.relation';
import { contextToolRelations } from '../../context/tool/context-tool.relation';
import { poiRelations } from '../../poi/poi.relation';
import { userRelations } from '../../user/user.relation';
import { models } from './models';

// IMPORTANT, the import order are matter for the relations.
export default {
  ...defineRelationsPart(models),
  ...userRelations,
  ...poiRelations,
  ...contextRelations,
  ...contextAccessRelations,
  ...contextHiddenRelations,
  ...contextLayerRelations,
  ...contextPermissionRelations,
  ...contextToolRelations
};
