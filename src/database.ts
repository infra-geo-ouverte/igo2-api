import * as Sequelize from 'sequelize';
import * as Configs from './configurations';

import { UserModel } from './user/user.model';
import { POIModel } from './poi/poi.model';
import { CatalogModel } from './catalog/catalog.model';
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
    poi: POIModel;
    catalog: CatalogModel;
    context: ContextModel;
    layer: LayerModel;
    tool: ToolModel;
    layerContext: LayerContextModel;
    toolContext: ToolContextModel;
    contextPermission: ContextPermissionModel;
}

const dbConfigs = Configs.getDatabaseConfig();

type IDBConf = Configs.IDatabaseConfiguration;
type IDBStringConf = Configs.IDBStringConfiguration;
type IPostgresConf = Configs.IPostgresConfiguration;
type ISqliteConf = Configs.ISqliteConfiguration;
let sequelize;
const dbString: IDBStringConf = <IDBStringConf>dbConfigs;
const dbConf: IDBConf = <IDBConf>dbConfigs;
if (dbString.connectionString) {
  sequelize = new Sequelize(dbString.connectionString);
} else if (dbConf) {
  const dbPG: IPostgresConf = <IPostgresConf>dbConfigs;
  sequelize = new Sequelize(dbPG.database, dbPG.username, dbPG.password, {
    host: dbPG.host,
    port: dbPG.port,
    dialect: dbPG.dialect
  });
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
db['poi'] = sequelize['import']('./poi/poi.model');
db['catalog'] = sequelize['import']('./catalog/catalog.model');
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
