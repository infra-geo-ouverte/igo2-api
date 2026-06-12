import { loadEnvFile } from '@igo2/base-api';
import { getAdminConfig } from '@igo2/fastify';
import { defineConfig } from 'drizzle-kit';

loadEnvFile();

const config = getAdminConfig(process.env);

const migrationConfig = defineConfig({
  out: './migrations',
  schema: ['./src/**/*.model.ts', './src/**/*.relation.ts'],
  dialect: 'postgresql',
  verbose: true,
  migrations: {
    schema: 'migrations',
    table: '__api_migrations'
  },
  schemaFilter: [process.env.DB_SCHEMA ?? 'public'],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dbCredentials: config as any
});

export default migrationConfig;

// Compatibilité CommonJS pour drizzle-kit lors de la lecture du fichier compilé
if (typeof module !== 'undefined' && module.exports) {
  Object.assign(module.exports, migrationConfig);
  module.exports.default = migrationConfig;
}
