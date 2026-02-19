import { AppDatabase } from '../../app.interface';

export type Transaction = Parameters<
  Parameters<AppDatabase['transaction']>[0] // NodePgDatabase
>[0];
