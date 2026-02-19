import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadEnvFile } from '@igo2/base-api';
import { $ } from 'execa';
import { GenericContainer, Wait } from 'testcontainers';
import { Environment } from 'testcontainers/build/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootPath = resolve(__dirname, '../../');

const appEnv: Environment = {};
loadEnvFile({ path: resolve(rootPath, '.env.example'), target: appEnv });

const environment = {
  ...(appEnv as Environment),
  POSTGRES_DB: appEnv.DB_NAME!,
  POSTGRES_USER: appEnv.DB_USER!,
  POSTGRES_PASSWORD: appEnv.DB_PASSWORD!,
  POSTGRES_HOST_AUTH_METHOD: 'trust'
} satisfies Environment;

const container = await new GenericContainer('postgis/postgis:latest')
  .withEnvironment(environment)
  .withExposedPorts(5432)
  .withWaitStrategy(
    Wait.forAll([
      Wait.forLogMessage('database system is ready to accept connections'),
      Wait.forListeningPorts()
    ])
  )
  .start();

const exec = $({
  env: {
    ...environment,
    DB_HOST: container.getHost(),
    DB_PORT: container.getMappedPort(5432).toString(),
    PGHOST: container.getHost(),
    PGPORT: container.getMappedPort(5432).toString(),
    PGUSER: appEnv.DB_USER,
    PGDATABASE: appEnv.DB_NAME,
    PGPASSWORD: appEnv.DB_PASSWORD
  },
  stdio: 'inherit'
});

console.log('Applying migrations...');
await exec`npm run migration:apply`;

console.log('Running E2E tests...');
const ouputE2e = await exec`npm run e2e`;

await container.stop();

if (ouputE2e.exitCode !== 0) {
  throw new Error();
}
