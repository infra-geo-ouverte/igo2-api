import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const rootDir = join(import.meta.dirname, '..', '..');
const packageJsonPath = join(rootDir, 'package.json');
const distPath = join(rootDir, 'dist');

const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

// Remove unwanted properties
delete packageJson.workspaces;
delete packageJson.scripts;
delete packageJson.dependencies;
delete packageJson.devDependencies;

// Ensure dist directory exists
mkdirSync(distPath, { recursive: true });

// Write filtered package.json to dist
writeFileSync(
  join(distPath, 'package.json'),
  JSON.stringify(packageJson, null, 2)
);

console.log('✓ package.json copied');
