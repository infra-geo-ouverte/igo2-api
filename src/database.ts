import * as Sequelize from 'sequelize';
import * as Configs from './configurations';

import { UserModel } from './user/user.model';
import { BookmarkModel } from './bookmark/bookmark.model';
import { ContextModel } from './context/context.model';
import { LayerModel } from './layer/layer.model';
import { ToolModel } from './tool/tool.model';
import { ToolContextModel } from './toolContext/toolContext.model';
import { LayerContextModel } from './layerContext/layerContext.model';
import {
  ContextPermissionModel
} from './contextPermission/contextPermission.model';

export interface IDatabase {
    sequelize: Sequelize.Sequelize;
    user: UserModel;
    bookmark: BookmarkModel;
    context: ContextModel;
    layer: LayerModel;
    tool: ToolModel;
    layerContext: LayerContextModel;
    toolContext: ToolContextModel;
    contextPermission: ContextPermissionModel;
}

const dbConfigs = Configs.getDatabaseConfig();

type IPostgresConf = Configs.IPostgresConfiguration;
type ISqliteConf = Configs.ISqliteConfiguration;
let sequelize;
const dbPG: IPostgresConf = <IPostgresConf>dbConfigs;
if (dbPG.connectionString) {
  sequelize = new Sequelize(dbPG.connectionString);
} else {
  const dbSqlite: ISqliteConf = <ISqliteConf>dbConfigs;
  sequelize = new Sequelize('database', 'username', 'password', {
    host: dbSqlite.host,
    dialect: dbSqlite.dialect,
    storage: dbSqlite.storage
  });
}

const db = {};
// Glob.sync('./src/**/*.model.ts').forEach((file) => {
//   const fileName = file.replace('./src/', './').replace('.ts', '');
//   const model = sequelize['import'](path.join(__dirname, fileName));
//   db[model['name']] = model;
// });

db['user'] = sequelize['import']('./user/user.model');
db['bookmark'] = sequelize['import']('./bookmark/bookmark.model');
db['layer'] = sequelize['import']('./layer/layer.model');
db['tool'] = sequelize['import']('./tool/tool.model');
db['context'] = sequelize['import']('./context/context.model');
db['contextPermission'] =
  sequelize['import']('./contextPermission/contextPermission.model');
db['layerContext'] = sequelize['import']('./layerContext/layerContext.model');
db['toolContext'] = sequelize['import']('./toolContext/toolContext.model');


db['sequelize'] = sequelize;

const database = <IDatabase>db;
export default database;
export { database };
