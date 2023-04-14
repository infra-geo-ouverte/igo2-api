import { ContextAccess } from './contextAccess.model';

export class ContextAccessService {
  public async update (
    contextId: string
  ): Promise<any> {
    const accessObj = await ContextAccess.findOne({
      where: {
        contextId
      }
    });

    if (accessObj) {
      return await ContextAccess.update(
        { contextId, calls: ++accessObj.calls },
        { where: { id: accessObj.id } }
      );
    } else {
      return await ContextAccess
        .create({ contextId, calls: 1 });
    }
  }
}
