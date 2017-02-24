import * as Sequelize from 'sequelize';
import * as Glob from 'glob';
import * as path from 'path';
import * as Configs from './configurations';

import { ContextModel } from './contexts/context.model';
import { LayerModel } from './layers/layer.model';
import { ToolModel } from './tools/tool.model';
import { LayerContextModel } from './layersContexts/layerContext.model';

export interface IDatabase {
    sequelize: Sequelize.Sequelize;
    context: ContextModel;
    layer: LayerModel;
    tool: ToolModel;
    layerContext: LayerContextModel;
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
Glob.sync('./src/**/*.model.ts').forEach((file) => {
  const fileName = file.replace('./src/', './').replace('.ts', '');
  const model = sequelize['import'](path.join(__dirname, fileName));
  db[model['name']] = model;
});

/*Object.keys(db).forEach(function(modelName) {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});*/

db['sequelize'] = sequelize;
// db['Sequelize'] = Sequelize;


export default <IDatabase>db;
