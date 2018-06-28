import * as Hapi from 'hapi';

export interface IPluginOptions {
  [key: string]: any;
}

export interface IPlugin {
  name: string;
  version: string;
  register(server: Hapi.Server, options?: IPluginOptions): Promise<void>;
}
