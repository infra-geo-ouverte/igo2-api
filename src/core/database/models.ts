import { catalogModel } from '../../catalog/catalog.model';
import { contextAccessModel } from '../../context/access/context-access.model';
import { contextModel, contextScopeEnum } from '../../context/context.model';
import { contextHiddenModel } from '../../context/hidden/context-hidden.model';
import { contextLayerModel } from '../../context/layer/context-layer.model';
import {
  contextPermissionModel,
  contextTypePermissionEnum
} from '../../context/permission/context-permission.model';
import { contextToolModel } from '../../context/tool/context-tool.model';
import { layerModel, layerTypeEnum } from '../../layer/layer.model';
import { poiModel } from '../../poi/poi.model';
import { profilModel } from '../../profil/profil.model';
import { toolModel } from '../../tool/tool.model';
import { userModel } from '../../user/user.model';

const enums = {
  ...contextTypePermissionEnum,
  ...layerTypeEnum,
  ...contextScopeEnum
};

// Important to export the enums, to let's know Drizzle about them for the migration
export const models = {
  catalog: catalogModel,
  context: contextModel,
  contextAccess: contextAccessModel,
  contextHidden: contextHiddenModel,
  contextLayer: contextLayerModel,
  contextPermission: contextPermissionModel,
  contextTool: contextToolModel,
  layer: layerModel,
  poi: poiModel,
  profil: profilModel,
  tool: toolModel,
  user: userModel,
  ...enums
};
