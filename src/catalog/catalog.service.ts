import { asc, eq } from 'drizzle-orm';

import { AppDatabase, AppInstance } from '../app.interface';
import { IProfils, hasRequiredProfils } from '../auth';
import { ICatalog, ICatalogIn } from './catalog.interface';
import { catalogModel } from './catalog.model';

export class CatalogService {
  private db: AppDatabase;

  constructor(private app: AppInstance) {
    this.db = app.db;
  }

  async create(catalogData: ICatalogIn): Promise<ICatalog> {
    const [catalog] = await this.db
      .insert(catalogModel)
      .values(catalogData)
      .returning();
    return catalog;
  }

  async update(id: number, catalogData: ICatalogIn): Promise<ICatalog> {
    const [catalog] = await this.db
      .update(catalogModel)
      .set(catalogData)
      .where(eq(catalogModel.id, id))
      .returning();
    return catalog;
  }

  async delete(id: number): Promise<number> {
    const catalog = await this.db
      .delete(catalogModel)
      .where(eq(catalogModel.id, id));
    return catalog.rowCount ?? 0;
  }

  async get(profils: IProfils): Promise<ICatalog[]> {
    const catalogs = await this.db
      .select()
      .from(catalogModel)
      .orderBy(asc(catalogModel.order));

    return catalogs.filter((c) => hasRequiredProfils(c.profils, profils));
  }

  async getById(id: number, profils: IProfils): Promise<ICatalog | undefined> {
    const [catalog] = await this.db
      .select()
      .from(catalogModel)
      .where(eq(catalogModel.id, id));

    if (!catalog) {
      return undefined;
    }

    if (!hasRequiredProfils(catalog.profils, profils)) {
      throw this.app.httpErrors.unauthorized();
    }

    return catalog;
  }
}
