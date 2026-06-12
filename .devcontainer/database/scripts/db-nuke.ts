import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { DatabaseConfig, getLocalConfig } from '@igo2/fastify';
import pg from 'pg';

const rootPath = resolve(__dirname, '../../..');

const dbConfig = getLocalConfig(process.env as unknown as DatabaseConfig);

async function reset() {
  console.log('Resetting database...');
  const start = Date.now();

  const sqlPath = resolve(
    rootPath,
    '.devcontainer/database/scripts/db-nuke.sql'
  );
  const query = readFileSync(sqlPath, 'utf8');

  const client = new pg.Client({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user ?? 'postgres',
    password: dbConfig.password,
    database: dbConfig.database,
    ssl: dbConfig.ssl
  });

  client.connect().catch((err) => {
    console.error(`Erreur connexion bd: `, err);
  });

  await client
    .query(query)
    .finally(() => {
      client.end();
    })
    .catch((err) => {
      console.error(`Erreur reset bd: `, err);
    });

  const end = Date.now();
  console.log(`✅ Reset end & took ${end - start}ms`);
  console.log('');
  process.exit(0);
}

reset().catch((err) => {
  console.error('Reset failed');
  console.error(err);
  process.exit(1);
});
