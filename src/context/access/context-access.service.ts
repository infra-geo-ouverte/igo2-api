import { sql } from 'drizzle-orm';

import { AppDatabase, AppInstance } from '../../app.interface';
import { IContextAccess } from './context-access.interface';
import { contextAccessModel } from './context-access.model';

export class ContextAccessService {
  private db: AppDatabase;

  constructor(app: AppInstance) {
    this.db = app.db;
  }

  async upsert(
    contextId: number
  ): Promise<IContextAccess | [affectedCount: number]> {
    const [result] = await this.db
      .insert(contextAccessModel)
      .values({ contextId, calls: 1 })
      .onConflictDoUpdate({
        target: contextAccessModel.contextId,
        set: {
          calls: sql`${contextAccessModel.calls} + 1`,
          accessedAt: sql`now()`
        }
      })
      .returning();

    return result;
  }
}
