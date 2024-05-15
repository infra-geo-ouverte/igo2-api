import { IBaseTool } from "../tool/tool.interface";

export interface IToolContext extends IBaseTool {
  toolId?: string;
  contextId?: string;
  enabled?: boolean;
  order?: number;
}
