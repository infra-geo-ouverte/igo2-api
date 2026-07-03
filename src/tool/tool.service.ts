import { eq } from 'drizzle-orm';

import { AppDatabase, AppInstance } from '../app.interface';
import { hasRequiredProfils } from '../auth';
import { IProfils } from '../auth/authentication/authentication.interface';
import { ITool, IToolIn } from './tool.interface';
import { toolModel } from './tool.model';

export class ToolService {
  private db: AppDatabase;

  constructor(private app: AppInstance) {
    this.db = app.db;
  }
  async create(tool: IToolIn): Promise<ITool> {
    const [result] = await this.db
      .insert(toolModel)
      .values({ ...tool, profils: cleanArray(tool.profils) })
      .returning();
    return result;
  }

  async update(id: number, tool: Partial<IToolIn>): Promise<ITool> {
    const [result] = await this.db
      .update(toolModel)
      .set({ ...tool, profils: cleanArray(tool.profils) })
      .where(eq(toolModel.id, id))
      .returning();
    return result;
  }

  async delete(id: number): Promise<number> {
    const result = await this.db.delete(toolModel).where(eq(toolModel.id, id));
    return result.rowCount ?? 0;
  }

  async get(profils: IProfils): Promise<ITool[]> {
    const tools = await this.db.select().from(toolModel);
    return tools.filter((t) => hasRequiredProfils(t.profils, profils));
  }

  async getById(id: number, profils: IProfils): Promise<ITool | undefined> {
    const [result] = await this.db
      .select()
      .from(toolModel)
      .where(eq(toolModel.id, id));

    if (!result) {
      return undefined;
    }

    if (!hasRequiredProfils(result.profils, profils)) {
      throw this.app.httpErrors.unauthorized();
    }

    return result;
  }
}
const cleanArray = (arr: string[] | null | undefined) => {
  if (!arr) return null;
  const filtered = arr.filter((i) => i !== '');
  return filtered.length === 0 ? null : filtered;
};
