import { Config, IPostgresConfiguration } from '@igo2/base-api';
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

Config.readConfig(__dirname, `../configurations/config.${process.env.NODE_ENV || 'dev'}.json`);
const dbConfig = Config.getDatabaseConfig() as IPostgresConfiguration;
const user = dbConfig.username;
const password = dbConfig.password;

const getRows = async (host, restreint): Promise<any> => {
  let query = 'select id, type, url, layers, "layerOptions", "sourceOptions" from layer';
  if (restreint) {
    query += ' where ("sourceOptions"::text != \'{}\'::text or "layerOptions"::text != \'{}\'::text)';
  }
  if (layerToMigrate) {
    query += restreint ? ' and ' : ' where ';
    query += `LOWER(layers) = LOWER('${layerToMigrate}')`;
  }

  const params = '--no-align -t --record-separator=\'#\'';
  return await new Promise((resolve, reject) => {
    exec(
      `PGPASSWORD="${password}" psql -h ${host} -U ${user} ${params} -c "${query.replace(/"/g, '\\"')}"`,
      (err, stdout, stderr) => {
        if (err) {
          return reject(err);
        }
        const rep = stdout
          .replace(/\n/g, '')
          .replace(/\s\s+/g, ' ')
          .split('#')
          .map(r => r.split('|'))
          .filter(r => r.length > 1);

        resolve(rep);
      }
    );
  });
};

const migrate = async () => {
  const fromRows = await getRows(fromHost, true);
  const toRows = await getRows(toHost, false);

  const diff = {
    toAdd: fromRows
      .filter(f => toRows.find(t => f[1] === t[1] && f[2] === t[2] && f[3] === t[3]) === undefined),
    toDelete: toRows
      .filter(f => (f[4] !== '' && f[4] !== '{}') || (f[5] !== '' && f[5] !== '{}'))
      .filter(f => fromRows.find(t => f[1] === t[1] && f[2] === t[2] && f[3] === t[3]) === undefined),
    toModify: fromRows
      .filter(f => {
        const toRow = toRows.find(t => f[1] === t[1] && f[2] === t[2] && f[3] === t[3]);
        if (!toRow) { return false; }
        f[4] = f[4] === '' ? '{}' : f[4];
        f[5] = f[5] === '' ? '{}' : f[5];
        toRow[4] = toRow[4] === '' ? '{}' : toRow[4];
        toRow[5] = toRow[5] === '' ? '{}' : toRow[5];
        return f[4] !== toRow[4] || f[5] !== toRow[5];
      })
  };

  for (const rAdd of diff.toAdd) {
    let query = `INSERT INTO layer(id, type, url, layers, global,
      "layerOptions", "sourceOptions", "createdAt", "updatedAt")
      VALUES (DEFAULT, '${rAdd[1]}', '${rAdd[2]}', '${rAdd[3]}', NULL,
      '${(rAdd[4] || '{}').replace(/'/g, '\'\'')}'::json, '${(rAdd[5] || '{}').replace(/'/g, '\'\'')}'::json,
      CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
    query = query.replace(/"/g, '\\"').replace(/\${/g, '\\${');
    exec(
      `PGPASSWORD="${password}" psql -h ${toHost} -U ${user} -c "${query}"`,
      (err, stdout, stderr) => {
        if (err) {
          console.error(err);
        } else {
          const name = rAdd[3] || rAdd[2];
          console.log(`Les options du layer '${name}' ont été ajoutés`);
        }
      }
    );
  }

  for (const rDelete of diff.toDelete) {
    let query = `update layer set "layerOptions"='{}'::json, "sourceOptions"='{}'::json,
      "updatedAt"=CURRENT_TIMESTAMP where id='${rDelete[0]}'`;
    query = query.replace(/"/g, '\\"');
    exec(
      `PGPASSWORD="${password}" psql -h ${toHost} -U ${user} -c "${query}"`,
      (err, stdout, stderr) => {
        if (err) {
          console.error(err);
        } else {
          const name = rDelete[3] || rDelete[2];
          console.log(`Les options du layer '${name}' ont été retirés`);
        }
      }
    );
  }

  for (const rModify of diff.toModify) {
    let query = `update layer set "layerOptions"='${(rModify[4] || '{}').replace(/'/g, '\'\'')}'::json,
      "sourceOptions"='${(rModify[5] || '{}').replace(/'/g, '\'\'')}'::json,
      "updatedAt"=CURRENT_TIMESTAMP
      where type='${rModify[1]}' and url='${rModify[2]}' and LOWER(layers)=LOWER('${rModify[3]}')`;
    query = query.replace(/"/g, '\\"').replace(/\${/g, '\\${');
    exec(
      `PGPASSWORD="${password}" psql -h ${toHost} -U ${user} -c "${query}"`,
      (err, stdout, stderr) => {
        if (err) {
          console.error(err);
        } else {
          const name = rModify[3] || rModify[2];
          console.log(`Les options du layer '${name}' ont été modifiés`);
        }
      }
    );
  }
};

migrate();
