import { IDatabase, database } from '@igo2/base-api';

export class ContextAccess {
  private database: IDatabase = database;

  constructor() {}

  public async update(
    contextId: string
  ): Promise<any> {
    const accessObj = await this.database.models.contextAccess.findOne({
      where: {
        contextId
      }
    });

    if (accessObj) {
      return await this.database.models.contextAccess.update(
        {contextId: contextId, calls: ++accessObj.calls},
        {where: {id: accessObj.id}}
      );
    } else {
      return await this.database.models.contextAccess
        .create({contextId: contextId, calls: 1});
    }
  }

}
