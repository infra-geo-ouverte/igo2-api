import { Sanitizer } from '@igo2/base-api';
import { StringArray } from '@igo2/fastify';
import axios from 'axios';
import * as https from 'https';
import Value from 'typebox/value';

import { AppInstance } from '../../app.interface';
import { getUrlHost } from '../../utils/url.utils';
import { LayerOptions, LayerType, SourceOptions } from '../layer.interface';
import { getParamsLayers } from '../utils/layer.utils';

interface LayerWssPermission {
  wmsAllowed?: boolean;
  wfsAllowed?: boolean;
}

export const LayerWssClient = axios.create();

/** Web Service Security */
export class LayerWss {
  private hasWssApi: boolean;

  constructor(private app: AppInstance) {
    this.hasWssApi = !!this.app.env.WSS_API;
    LayerWssClient.defaults.baseURL = this.app.env.WSS_API;
  }

  get hosts() {
    return Value.Decode(StringArray(), this.app.env.OGC_WSS_HOSTS);
  }

  get wssUri() {
    return this.app.env.OGC_WSS_URI;
  }

  async setWssOptions(
    layer: LayerOptions,
    url: string | undefined
  ): Promise<LayerOptions> {
    if (!layer.sourceOptions || !layer.type) {
      return layer;
    }

    const permissions = await this.getPermissions(
      layer.sourceOptions,
      layer.type
    );
    if (!permissions) {
      return layer;
    }

    if (layer.sourceOptions?.type === 'wms') {
      layer = this.setWmsOptions(layer, permissions, url);
    }
    return layer;
  }

  private async getPermissions(
    sourceOptions: SourceOptions,
    type: LayerType
  ): Promise<LayerWssPermission | undefined> {
    if (!sourceOptions.url || !this.hasWssApi) {
      return undefined;
    }

    const [url, host] = this.getUrlSafely(sourceOptions.url);
    if (!url || !host) {
      return undefined;
    }

    const isAllowedHost = this.hosts.length === 0 || this.hosts.includes(host);
    const isWssPath = url.pathname.startsWith(this.wssUri ?? '');

    if (!isAllowedHost || !isWssPath) {
      return undefined;
    }

    const permission = await this.getLayerPermission(sourceOptions);

    // We check if the specific service (WMS/WFS) is allowed
    const isDenied =
      (type === 'wms' && !permission.wmsAllowed) ||
      (type === 'wfs' && !permission.wfsAllowed);

    return isDenied ? ({} as LayerWssPermission) : permission;
  }

  private getUrlSafely(url: string): [url: URL, host: string] | [] {
    try {
      const _url = new URL(url);
      const host = `${_url.protocol}//${_url.hostname}`;
      return [_url, host];
    } catch {
      return [];
    }
  }

  private async getLayerPermission(
    sourceOptions: SourceOptions
  ): Promise<LayerWssPermission> {
    const url = sourceOptions?.url;

    // For security concern about the "Type confusion CWE-843", we need to double check if the url is a string
    const theme =
      url && typeof url === 'string'
        ? url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.fcgi'))
        : undefined;
    https.globalAgent.options.rejectUnauthorized = false;
    const layers = getParamsLayers(sourceOptions);

    // For security and Server side request forgery (SSRF) compliance we sanitize the value
    const urlSanitized = Sanitizer.sanitizeString(
      `/layers/${layers}/allowed?theme=${theme}`
    );
    const response = await LayerWssClient.get<LayerWssPermission>(urlSanitized);
    return response.data;
  }

  private setWmsOptions(
    layer: LayerOptions,
    permissions: LayerWssPermission,
    queryUrl: string | undefined
  ): LayerOptions {
    if (permissions.wfsAllowed) {
      return this.addWfsCompatibility(layer, queryUrl);
    }

    return layer;
  }

  private addWfsCompatibility(
    layer: LayerOptions,
    queryUrl: string | undefined
  ): LayerOptions {
    const { sourceOptions } = layer;
    if (!sourceOptions) {
      return layer;
    }

    let urlWfs: string | undefined;
    if (queryUrl && sourceOptions.url) {
      const host = getUrlHost(queryUrl, this.hosts);
      if (host) {
        // Check if sourceOptions.url already starts with the host to avoid duplication
        urlWfs = sourceOptions.url.startsWith(host)
          ? sourceOptions.url
          : host + sourceOptions.url;
      }
    }

    return {
      ...layer,
      workspace: {
        ...layer.workspace,
        enabled: true
      },
      sourceOptions: {
        ...sourceOptions,
        urlWfs,
        paramsWFS: {
          ...sourceOptions.paramsWFS!,
          featureTypes: getParamsLayers(sourceOptions) ?? ''
        }
      }
    };
  }
}
