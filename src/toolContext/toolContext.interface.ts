import { IBaseTool } from '../tool/tool.interface';

export interface IToolContext extends IBaseTool {
  toolId?: string;
  contextId?: number;
  enabled?: boolean;
  order?: number;
}
