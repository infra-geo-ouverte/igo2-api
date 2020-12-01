import * as Configs from '../configurations';
import { exec } from 'child_process';

const args = process.argv.slice(2);
const fromHost = args[0];
const toHost = args[1];
const layerToMigrate = args[2];

if (!fromHost || !toHost) {
  console.error('Mauvaise commande: ');
  console.error('npm run migrate -- fromHost toHost layerToMigrate');
  process.exit(1);
}

const dbConfig = Configs.getDatabaseConfig() as Configs.IPostgresConfiguration;
const user =  dbConfig.username;
const password = dbConfig.password;

const getRows = async (host, restreint): Promise<any> => {
  let query = `select * from layer`;
  if (restreint) {
    query += ` where (\\"sourceOptions\\"::text != '{}'::text or \\"layerOptions\\"::text != '{}'::text)`;
  }
  if (layerToMigrate) {
    query += restreint ? ' and ' : ' where ';
    query += `layers = '${layerToMigrate}'`;
  }
  return await new Promise((resolve, reject) => {
    exec(
      `PGPASSWORD="${password}" psql -h ${host} -U ${user} --no-align -t --record-separator='#' -c "${query}"`,
      (err, stdout, stderr) => {
        if (err) {
          return reject(err);
        }
        resolve(stdout.replace(/\s\s+/g, ' ').split('#').map(r => r.split('|')));
      }
    );
  });
}

const migrate = async () => {
  const fromRows = await getRows(fromHost, true);
  const toRows = await getRows(toHost, false);

  const diff = {
    toAdd: fromRows
      .filter(f => toRows.find(t => f[1] === t[1] && f[2] === t[2] && f[3] === t[3]) === undefined),
    toDelete: toRows
      .filter(f => (f[5] !== '' && f[5] !== '{}') || (f[6] !== '' && f[6] !== '{}') )
      .filter(f => fromRows.find(t => f[1] === t[1] && f[2] === t[2] && f[3] === t[3]) === undefined),
    toModify: fromRows
      .filter(f => {
        const toRow = toRows.find(t => f[1] === t[1] && f[2] === t[2] && f[3] === t[3]);
        if (!toRow) { return false; }
        f[5] = f[5] === '' ? '{}' : f[5];
        f[6] = f[6] === '' ? '{}' : f[6];
        toRow[5] = toRow[5] === '' ? '{}' : toRow[5];
        toRow[6] = toRow[6] === '' ? '{}' : toRow[6];
        return f[5] !== toRow[5] || f[6] !== toRow[6];
      })
  };

  for (const rAdd of diff.toAdd) {
    const query = `INSERT INTO layer VALUES (DEFAULT, '${rAdd[1]}', '${rAdd[2]}', '${rAdd[3]}', NULL,
      '${rAdd[5]}'::json, '${rAdd[6]}'::json, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
    exec(
      `PGPASSWORD="${password}" psql -h ${toHost} -U ${user} -c "${query.replace(/"/g, '\\"').replace(/'/g, "\\'")}"`,
      (err, stdout, stderr) => {
        if (err) {
          console.error(err);
        } else {
          console.log(`Layer '${rAdd[3]}' a été ajouté`);
        }
      }
    );
  }

  for (const rDelete of diff.toDelete) {
    const query = `update layer set "layerOptions"='{}'::json, "sourceOptions"='{}'::json,
      "updatedAt"=CURRENT_TIMESTAMP where id='${rDelete[0]}'`;
    exec(
      `PGPASSWORD="${password}" psql -h ${toHost} -U ${user} -c "${query.replace(/"/g, '\\"').replace(/'/g, "\\'")}"`,
      (err, stdout, stderr) => {
        if (err) {
          console.error(err);
        } else {
          console.log(`Layer '${rDelete[3]}' a été retiré`);
        }
      }
    );
  }

  for (const rModify of diff.toModify) {
    const query = `update layer set "layerOptions"='${rModify[5]}'::json, "sourceOptions"='${rModify[6]}'::json,
      "updatedAt"=CURRENT_TIMESTAMP where type='${rModify[1]}' and url='${rModify[2]}' and layers='${rModify[3]}'`;
    exec(
      `PGPASSWORD="${password}" psql -h ${toHost} -U ${user} -c "${query.replace(/"/g, '\\"').replace(/'/g, "\\'")}"`,
      (err, stdout, stderr) => {
        if (err) {
          console.error(err);
        } else {
          console.log(`Layer '${rModify[3]}' a été modifié`);
        }
      }
    );
  }
}

migrate();
