import { ITool } from '../../tool';
import { contextToolModel } from './context-tool.model';

export type IContextTool = typeof contextToolModel.$inferSelect;
export type IContextToolIn = typeof contextToolModel.$inferInsert;

export interface IContextToolWithRelations extends IContextTool {
  tool: ITool | null;
}
