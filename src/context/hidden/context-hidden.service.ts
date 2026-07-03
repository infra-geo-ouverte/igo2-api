import { and, eq } from 'drizzle-orm';

import { AppDatabase, AppInstance } from '../../app.interface';
import { IContextHidden } from './context-hidden.interface';
import { contextHiddenModel } from './context-hidden.model';

export class ContextHiddenService {
  private db: AppDatabase;

  constructor(app: AppInstance) {
    this.db = app.db;
  }

  async hide(userId: number, contextId: number): Promise<IContextHidden> {
    const [hidden] = await this.db
      .insert(contextHiddenModel)
      .values({
        userId,
        contextId
      })
      .returning();
    return hidden;
  }

  async show(userId: number, contextId: number): Promise<void> {
    await this.db
      .delete(contextHiddenModel)
      .where(
        and(
          eq(contextHiddenModel.userId, userId),
          eq(contextHiddenModel.contextId, contextId)
        )
      );
  }

  async get(userId: number): Promise<IContextHidden[]> {
    return this.db.query.contextHidden.findMany({
      where: {
        userId
      }
    });
  }

  async getById(
    userId: number,
    contextId: number
  ): Promise<IContextHidden | undefined> {
    return this.db.query.contextHidden.findFirst({
      where: {
        contextId,
        userId
      }
    });
  }
}
