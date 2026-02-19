import { asc, desc, eq, inArray } from 'drizzle-orm';

import { AppDatabase, AppInstance } from '../app.interface';
import { IProfils } from '../auth/authentication/authentication.interface';
import { IProfil, IProfilIn } from './profil.interface';
import { profilModel } from './profil.model';

export class ProfilService {
  private db: AppDatabase;

  constructor(app: AppInstance) {
    this.db = app.db;
  }
  async create(profilData: IProfilIn): Promise<IProfil> {
    const [result] = await this.db
      .insert(profilModel)
      .values(profilData)
      .returning();
    return result;
  }

  async update(
    profilName: string,
    profilData: IProfilIn
  ): Promise<[affectedCount: number]> {
    const result = await this.db
      .update(profilModel)
      .set(profilData)
      .where(eq(profilModel.name, profilName));
    return [result.rowCount ?? 0];
  }

  async delete(profilName: string): Promise<number> {
    const result = await this.db
      .delete(profilModel)
      .where(eq(profilModel.name, profilName));
    return result.rowCount ?? 0;
  }

  async get(): Promise<IProfil[]> {
    return this.db.select().from(profilModel).orderBy(asc(profilModel.id));
  }

  async getById(id: number): Promise<IProfil | undefined> {
    const [result] = await this.db
      .select()
      .from(profilModel)
      .where(eq(profilModel.id, id));
    return result;
  }

  async getByName(name: string): Promise<IProfil | undefined> {
    const [result] = await this.db
      .select()
      .from(profilModel)
      .where(eq(profilModel.name, name));
    return result;
  }

  async getByProfils(profils: IProfils): Promise<IProfil[]> {
    if (profils.length === 0) {
      return [];
    }
    return this.db
      .select()
      .from(profilModel)
      .where(inArray(profilModel.name, profils))
      .orderBy(desc(profilModel.id));
  }
}
