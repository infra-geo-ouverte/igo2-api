export interface ITool {
  id?: string;
  name: string;
  title?: string;
  tooltip?: string;
  icon?: string;
  inToolbar?: boolean;
  global?: boolean;
  order?: number;
  options?: { [key: string]: any };
  profils: string[];
}
