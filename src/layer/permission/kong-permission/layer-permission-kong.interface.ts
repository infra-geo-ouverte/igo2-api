export interface IRouteConfig {
  id: string;
  name?: string;
  created_at: number;
  service?: {
    id: number;
  };
  // Chemins et méthodes
  paths: string[];
  methods: ('GET' | 'POST' | 'OPTIONS' | 'PUT' | 'DELETE' | string)[];
  protocols: ('http' | 'https' | string)[];
  // Configuration réseau
  hosts: string[] | null;
  destinations: string[] | null;
  headers: Record<string, string[]> | null;
  // Paramètres de comportement
  path_handling: 'v1' | string;
  preserve_host: boolean;
  request_buffering: boolean;
  https_redirect_status_code: number;
  regex_priority: number;
}

interface ICorsPluginConfig {
  max_age?: number;
  origins?: string[];
  exposed_headers: string[];
  methods?: string[];
  preflight_continue: boolean;
  headers: string[];
  credentials: boolean;
  allow?: string[];
  deny?: string[];
}

export interface IApiPlugin {
  id: string;
  name: 'cors' | string;
  created_at: number;
  enabled: boolean;
  config: ICorsPluginConfig;
  protocols: ('http' | 'https' | string)[];
  service: {
    id: string;
  } | null;
  route: {
    id: string;
  } | null;
  consumer: {
    id: string;
  } | null;
  tags: string[] | null;
}
