import * as Sequelize from "sequelize";
import * as Glob from 'glob';
import * as path from 'path';
import * as Configs from "./configurations";

import {ContextModel} from "./contexts/context.model";

export interface IDatabase {
    sequelize: Sequelize.Sequelize;
    context: ContextModel;
}

const dbConfigs = Configs.getDatabaseConfig();

let sequelize;
let dbPG: Configs.IPostgresConfiguration = <Configs.IPostgresConfiguration>dbConfigs;
if (dbPG.connectionString) {
  sequelize = new Sequelize(dbPG.connectionString);
} else {
  let dbSqlite: Configs.ISqliteConfiguration = <Configs.ISqliteConfiguration>dbConfigs;
  sequelize = new Sequelize('database', 'username', 'password', {
    host: dbSqlite.host,
    dialect: dbSqlite.dialect,
    storage: dbSqlite.storage
  });
}

let db = {};
Glob.sync("./src/**/*.model.ts").forEach((file) => {
   var model = sequelize['import'](path.join(__dirname, file.replace("./src/", "./").replace(".ts", "")));
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
