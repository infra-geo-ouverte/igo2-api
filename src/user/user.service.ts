import { eq } from 'drizzle-orm';

import { AppDatabase, AppInstance } from '../app.interface';
import { IUser, IUserIn } from './user.interface';
import { userModel } from './user.model';

export class UserService {
  private db: AppDatabase;

  constructor(app: AppInstance) {
    this.db = app.db;
  }

  async create(userIn: IUserIn): Promise<IUser> {
    const [result] = await this.db.insert(userModel).values(userIn).returning();
    return result;
  }

  async update(
    id: number,
    userIgo: Partial<IUserIn>
  ): Promise<{ id: number } | undefined> {
    const [result] = await this.db
      .update(userModel)
      .set(userIgo)
      .where(eq(userModel.id, id))
      .returning();

    return result;
  }

  async delete(id: number): Promise<number> {
    const result = await this.db
      .delete(userModel)
      .where(eq(userModel.id, id))
      .returning({ id: userModel.id });
    return result.length;
  }

  async get(id: number): Promise<IUser | undefined> {
    const [result] = await this.db
      .select()
      .from(userModel)
      .where(eq(userModel.id, id));
    return result;
  }

  async getByExternalId(externalId: number): Promise<IUser | undefined> {
    const [result] = await this.db
      .select()
      .from(userModel)
      .where(eq(userModel.externalId, externalId));
    return result;
  }

  async getOrCreateByExternalId(externalId: number): Promise<IUser> {
    let user = await this.getByExternalId(externalId);
    if (!user) {
      user = await this.create({ externalId });
    }
    return user;
  }
}
