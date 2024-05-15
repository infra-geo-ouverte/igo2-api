export interface ITool extends IBaseTool {
  name: string;
  title?: string;
  tooltip?: string;
  icon?: string;
  inToolbar?: boolean;
  order?: number;
  profils: string[];
}

export interface IBaseTool {
  id?: string;
  global?: boolean;
  options?: { [key: string]: any };
}
