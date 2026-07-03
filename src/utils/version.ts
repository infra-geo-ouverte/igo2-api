import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { Environments } from '@igo2/fastify';

export function getPackageVersion(environment: Environments): string {
  const packagePath = join(
    process.cwd(),
    environment !== 'local' ? 'dist' : '',
    'package.json'
  );
  try {
    const rootPackage = JSON.parse(readFileSync(packagePath, 'utf-8'));
    return rootPackage.version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}
