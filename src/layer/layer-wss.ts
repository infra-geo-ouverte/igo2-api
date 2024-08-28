import * as URL from 'url';
import * as https from 'https';
import axios from 'axios';
import * as Boom from '@hapi/boom';

import { getServerConfig } from '../configurations';
import { ILayer } from './layer.interface';
import { getUrlHost } from '../utils/url.utils';
import { Request } from '@hapi/hapi';

interface LayerPermission {
  wmsAllowed?: boolean;
  wfsAllowed?: boolean;
}

const ServerConfigs = getServerConfig();

export class LayerWss {
  static async setWssOptions(layer: ILayer, request: Request): Promise<ILayer> {
    const permissions = await LayerWss.getPermissions(layer, request.headers);
    if (!permissions) {
      return layer;
    }

    if (layer.type === 'wms') {
      LayerWss.setWmsOption(layer, permissions, request.query.url);
    }

    return layer;
  }

  private static async getPermissions(layer: ILayer, headers: object): Promise<LayerPermission | undefined> {
    const localhost = ServerConfigs.localhost;
    const wssUri = localhost ? localhost.wssUri : undefined;
    const hosts = localhost ? localhost.hosts : [];

    const urlObj = URL.parse(layer.url || '');
    const urlHost = urlObj && urlObj.hostname ? urlObj.protocol + '//' + urlObj.hostname : '';

    const isInWssUri = wssUri && urlObj.pathname?.substr(0, wssUri.length) === wssUri;

    if (ServerConfigs.wssApi && (!urlHost || hosts.indexOf(urlHost) !== -1) && isInWssUri) {
      const theme = layer.url.substring(layer.url.lastIndexOf('/') + 1, layer.url.lastIndexOf('.fcgi'));
      https.globalAgent.options.rejectUnauthorized = false;
      try {
        const url = `${ServerConfigs.wssApi}layers/${layer.layers}/allowed?theme=${theme}`;
        const { data: permission } = await axios.get(url, {
          headers: {
            'x-consumer-id': headers['x-consumer-id'],
            'x-consumer-username': headers['x-consumer-username'],
            'x-consumer-groups': headers['x-consumer-groups']
          }
        });

        if (layer.type === 'wms') {
          if (!permission.wmsAllowed) {
            return {};
          }
        } else if (layer.type === 'wfs') {
          if (!permission.wfsAllowed) {
            return {};
          }
        }

        return permission;
      } catch (error) {
        throw Boom.badImplementation(error);
      }
    }
  }

  private static setWmsOption(layer: ILayer, permissions: LayerPermission, queryUrl: string): void {
    if (permissions.wfsAllowed) {
      layer.layerOptions = {
        workspace: {
          enabled: true
        },
        ...layer.layerOptions
      };

      layer.sourceOptions = {
        urlWfs: layer.url ? getUrlHost(queryUrl) + layer.url : undefined,
        paramsWFS: {
          featureTypes: layer.layers
        }
      };
    }
  }
}
