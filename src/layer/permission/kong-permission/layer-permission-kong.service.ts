import { StringArray } from '@igo2/fastify';
import axios from 'axios';
import Value from 'typebox/value';

import { AppInstance } from '../../../app.interface';
import { IProfils } from '../../../auth/authentication';
import { hasRequiredProfils } from '../../../auth/authorization';
import { ILayerPermission } from '../shared/permission.interface';
import { IApiPlugin, IRouteConfig } from './layer-permission-kong.interface';

export const LayerPermissionKongClient = axios.create();

export class LayerPermissionKongApi implements ILayerPermission {
  private ogcWsshosts: string[];
  private ogcWssBasePaths: string[];

  constructor(private app: AppInstance) {
    LayerPermissionKongClient.defaults.baseURL = this.app.env.KONG_API;

    this.ogcWsshosts = Value.Decode(StringArray(), app.env.OGC_WSS_HOSTS);
    this.ogcWssBasePaths = app.env.OGC_WSS_BASE_PATHS;
  }

  /**
   * Si une couche n'est pas dans OGC-WSS mais qu'on veut tout de même ajouter une gestion de permission on peut utiliser KONG et le plugin ACCESS CONTROL LIST (ACL)
   */
  async verifyPermissionByUrl(
    url: string | undefined,
    profils: IProfils
  ): Promise<boolean> {
    if (!url) {
      return true;
    }

    const urlObj = new URL(url);

    const baseUrl = `${urlObj.protocol}//${urlObj.hostname}`;
    const pathname = urlObj.pathname ?? '';

    if (this.ogcWsshosts.includes(baseUrl) && this.isInBasePath(pathname)) {
      return this.verifyByPathname(pathname, profils);
    } else {
      return true;
    }
  }

  private isInBasePath(pathname: string): boolean {
    return this.ogcWssBasePaths.some((base) => pathname.startsWith(base));
  }

  private async verifyByPathname(pathname: string, profils: IProfils) {
    const route = await this.getRouteByUri(pathname);
    if (!route) {
      return false;
    }

    return this.verifyService(route, profils);
  }

  private async verifyService(
    route: IRouteConfig,
    profils: IProfils
  ): Promise<boolean> {
    if (!route.service) {
      return false;
    }

    // Les plugins représente des restrictions, si on n'a pas de plugin pas de restriction
    const plugins = await this.getPlugins(route.service.id);
    if (!plugins) {
      return true;
    }

    // ACCESS CONTROL LIST (ACL), notre plugin de permission
    const acl = plugins.find(
      (plugin) => plugin.name === 'acl' && plugin.enabled
    );
    // S'il n'est pas présent, c'est qu'il n'y a pas de restriction
    if (!acl) {
      return true;
    }

    let allowed = true;
    if (acl.config.allow?.length) {
      allowed = hasRequiredProfils(acl.config.allow, profils);
    }

    if (acl.config.deny?.length) {
      const hasDeniedProfil = hasRequiredProfils(acl.config.deny, profils);
      allowed = !hasDeniedProfil;
    }

    return allowed;
  }

  private async getRouteByUri(uri: string): Promise<IRouteConfig | undefined> {
    if (!uri) {
      return;
    }

    const routes = await this.getRoutes();
    if (!routes?.length) {
      return;
    }

    const routeFound = routes.find((route) => {
      if (route.paths && !!route.paths.length) {
        const pathFiltered = route.paths.filter((path: string) => {
          return path.length > 3 && uri.indexOf(path) === 0;
        });

        return pathFiltered.length > 0;
      }
      return false;
    });

    return routeFound;
  }

  private async getRoutes(): Promise<IRouteConfig[]> {
    const res = await LayerPermissionKongClient.get<{ data: IRouteConfig[] }>(
      '/routes'
    );
    return res.data.data;
  }

  private async getPlugins(id: number): Promise<IApiPlugin[]> {
    const res = await LayerPermissionKongClient.get<{ data: IApiPlugin[] }>(
      `/services/${id}/plugins`
    );
    return res.data.data;
  }
}
