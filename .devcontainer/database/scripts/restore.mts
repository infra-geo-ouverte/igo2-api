import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { execa } from 'execa';

const backupFolder =
  process.argv[2] ??
  resolve(process.cwd(), '.devcontainer/database/docker-entrypoint-initdb.d');

const scriptsFolder = resolve(process.cwd(), '.devcontainer/database/scripts');

if (!existsSync(backupFolder)) {
  exitWithError(`Backup folder not found: ${backupFolder}`);
}

console.log(`Scanning folder: ${backupFolder}`);

// Detect if running inside a container
const isInsideContainer = existsSync('/.dockerenv');
console.log(`Running inside container: ${isInsideContainer}`);

const env = {
  PGHOST: isInsideContainer ? 'database' : '127.0.0.1',
  PGPORT: '5432',
  PGUSER: 'postgres',
  PGPASSWORD: 'postgres',
  PGDATABASE: 'postgres'
};

const $ = execa({
  stdio: 'inherit',
  env
});

const $Bash = execa({
  stdio: 'inherit',
  shell: '/bin/bash',
  env
});

// --- Database Startup Logic ---
if (!isInsideContainer) {
  await $Bash(`docker compose -f .devcontainer/docker-compose.yml stop`);
  await $Bash(
    `docker compose -f .devcontainer/docker-compose.yml up -d database`
  );

  let ready = false;
  let attempts = 0;
  const maxAttempts = 30;
  while (!ready && attempts < maxAttempts) {
    try {
      await $Bash(`pg_isready -h ${env.PGHOST} -p ${env.PGPORT}`);
      ready = true;
      console.log('PostgreSQL is ready');
    } catch {
      attempts++;
      console.log(
        `Waiting for postgres... (attempt ${attempts}/${maxAttempts})`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  if (!ready) {
    exitWithError('PostgreSQL failed to start after maximum attempts');
  }
}

// --- Reset Database ---
try {
  console.log('Dropping existing database...');
  const sqlPath = resolve(scriptsFolder, 'db-nuke.sql');
  await $({
    stdio: ['pipe', 'inherit', 'inherit'],
    env
  })`psql -f ${sqlPath} ${env.PGDATABASE}`;
} catch (e) {
  console.log('Nothing to drop...', e);
}

if (!isInsideContainer) {
  await execInDatabaseContainer(
    `createdb -U ${env.PGUSER} --owner="${env.PGUSER}" "${env.PGDATABASE}"`
  );
} else {
  // If inside, we might need to recreate it if we just dropped it
  try {
    await $Bash(`createdb -U ${env.PGUSER} "${env.PGDATABASE}"`);
  } catch {}
}

// --- Iterative Execution of SQL Files ---

// 1. Get and sort files
const files = readdirSync(backupFolder)
  .filter((file) => file.endsWith('.sql') || file.endsWith('.sql.gz'))
  .sort(); // This ensures 00- runs before 01-, etc.

console.log(`Found ${files.length} migration files to execute.`);

for (const file of files) {
  const filePath = join(backupFolder, file);
  console.log(`---> Executing: ${file}`);

  if (file.endsWith('.gz')) {
    // Handle compressed files
    const { stdout: decompressed } = await $({
      stdio: ['ignore', 'pipe', 'inherit']
    })`zcat ${filePath}`;

    await $({
      input: decompressed,
      stdio: ['pipe', 'inherit', 'inherit'],
      env
    })`psql ${env.PGDATABASE}`;
  } else {
    // Handle plain SQL files
    await $({
      input: readFileSync(filePath, 'utf8'),
      stdio: ['pipe', 'inherit', 'inherit'],
      env
    })`psql ${env.PGDATABASE}`;
  }
}

await $Bash(`npm run migration:apply`);

console.log('✅ All migrations applied successfully.');

// --- Helpers ---

async function execInDatabaseContainer(cmd: string) {
  const command = `docker compose -f .devcontainer/docker-compose.yml exec -T database /bin/sh -c "${cmd}"`;
  await $Bash`${command}`;
}

function exitWithError(message: string) {
  console.error(`Error: ${message}`);
  process.exit(1);
}
