import { and, eq } from 'drizzle-orm';

import { AppDatabase, AppInstance } from '../app.interface';
import { IPoi, IPoiIn } from './poi.interface';
import { poiModel } from './poi.model';

export class PoiService {
  private db: AppDatabase;

  constructor(app: AppInstance) {
    this.db = app.db;
  }

  async create(poi: IPoiIn): Promise<IPoi> {
    const { id, ...values } = poi;
    const [result] = await this.db.insert(poiModel).values(values).returning();
    return result;
  }

  async update(id: number, poi: Partial<IPoiIn>): Promise<IPoi> {
    const [result] = await this.db
      .update(poiModel)
      .set(poi)
      .where(eq(poiModel.id, id))
      .returning();
    return result;
  }

  async delete(id: number, userId: number): Promise<number> {
    const result = await this.db
      .delete(poiModel)
      .where(and(eq(poiModel.id, id), eq(poiModel.userId, userId)));
    return result.rowCount ?? 0;
  }

  async getAll(userId: number): Promise<IPoi[]> {
    return this.db.select().from(poiModel).where(eq(poiModel.userId, userId));
  }

  async getById(id: number, userId: number): Promise<IPoi | undefined> {
    const [result] = await this.db
      .select()
      .from(poiModel)
      .where(and(eq(poiModel.id, id), eq(poiModel.userId, userId)));
    return result;
  }
}
