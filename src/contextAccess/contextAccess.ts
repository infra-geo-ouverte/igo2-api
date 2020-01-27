import { IDatabase, database } from '../database';

export class ContextAccess {
  private database: IDatabase = database;

  constructor() {}

  public async update(
    contextId: string
  ): Promise<any> {
    const accessObj = await this.database.contextAccess.findOne({
      where: {
        contextId
      }
    });

    if (accessObj) {
      return await this.database.contextAccess.update(
        {contextId: contextId, calls: ++accessObj.calls},
        {where: {id: accessObj.id}}
      );
    } else {
      return await this.database.contextAccess
        .create({contextId: contextId, calls: 1});
    }
  }

}
