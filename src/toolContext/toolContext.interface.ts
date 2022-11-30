export interface IToolContext {
  id?: string;
  toolId?: string;
  contextId?: string;
  enabled?: boolean;
  order?: number;
  global?: boolean;
  options?: { [key: string]: any };
}
