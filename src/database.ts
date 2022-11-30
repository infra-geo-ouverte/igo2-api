import { Sequelize } from 'sequelize';
import * as Configs from './configurations';

import { User } from './user/user.model';
import { Poi } from './poi/poi.model';
import { Catalog } from './catalog/catalog.model';
import { Context } from './context/context.model';
import { ContextAccess } from './contextAccess/contextAccess.model';
import { ContextHidden } from './contextHidden/contextHidden.model';
import { UserIgo } from './userIgo/userIgo.model';
import { ProfilIgo } from './profilIgo/profilIgo.model';
import { Layer } from './layer/layer.model';
import { Tool } from './tool/tool.model';
import { ToolContext } from './toolContext/toolContext.model';
import { LayerContext } from './layerContext/layerContext.model';
import { ContextPermission } from './contextPermission/contextPermission.model';

export interface IDatabase {
  sequelize: Sequelize;
  context: Context;
  contextAccess: ContextAccess;
  contextHidden: ContextHidden;
  user: User;
  userIgo: UserIgo;
  profilIgo: ProfilIgo;
  poi: Poi;
  catalog: Catalog;
  layer: Layer;
  tool: Tool;
  layerContext: LayerContext;
  toolContext: ToolContext;
  contextPermission: ContextPermission;
}

const dbConfigs = Configs.getDatabaseConfig();

type IDBConf = Configs.IDatabaseConfiguration;
type IDBStringConf = Configs.IDBStringConfiguration;
type IPostgresConf = Configs.IPostgresConfiguration;
type ISqliteConf = Configs.ISqliteConfiguration;
let sequelize;
const dbString: IDBStringConf = dbConfigs as IDBStringConf;
const dbConf: IDBConf = dbConfigs as IDBConf;

if (dbString.connectionString) {
  sequelize = new Sequelize(dbString.connectionString);
} else if (dbConf.dialect === 'postgres') {
  const dbPG: IPostgresConf = dbConfigs as IPostgresConf;
  sequelize = new Sequelize(dbPG.database, dbPG.username, dbPG.password, {
    host: dbPG.host,
    port: dbPG.port,
    dialect: dbPG.dialect
  });
} else {
  const dbSqlite: ISqliteConf = dbConfigs as ISqliteConf;
  sequelize = new Sequelize('database', 'username', 'password', {
    host: dbSqlite.host,
    dialect: dbSqlite.dialect,
    storage: dbSqlite.storage
  });
}

const db = {} as any;
db.context = sequelize.import('./context/context.model');
db.contextAccess = sequelize.import('./contextAccess/contextAccess.model');
db.contextHidden = sequelize.import('./contextHidden/contextHidden.model');
db.user = sequelize.import('./user/user.model');
db.userIgo = sequelize.import('./userIgo/userIgo.model');
db.profilIgo = sequelize.import('./profilIgo/profilIgo.model');
db.poi = sequelize.import('./poi/poi.model');
db.catalog = sequelize.import('./catalog/catalog.model');
db.layer = sequelize.import('./layer/layer.model');
db.tool = sequelize.import('./tool/tool.model');
db.contextPermission = sequelize.import('./contextPermission/contextPermission.model');
db.layerContext = sequelize.import('./layerContext/layerContext.model');
db.toolContext = sequelize.import('./toolContext/toolContext.model');

db.sequelize = sequelize;

const database = db as IDatabase;
export default database;
export { database };
