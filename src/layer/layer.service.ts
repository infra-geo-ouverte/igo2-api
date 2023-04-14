import * as Boom from '@hapi/boom';
import * as URL from 'url';
import { Op } from 'sequelize';

import { ObjectUtils } from '@igo2/base-api';
import { getServerConfig } from '../configurations';
import { UserApi } from '../user';
import { ILayer } from './layer.interface';
import { Layer } from './layer.model';
import axios from 'axios';
import * as xml2js from 'xml2js';
import { Md5 } from 'ts-md5';
import { PCacheable } from 'ts-cacheable';

const ServerConfigs = getServerConfig();

export class LayerService {
  public async create (layer: ILayer): Promise<Layer> {
    if (!layer.profils && layer.layerOptions.security?.profils.length > 0) {
      layer.profils = layer.layerOptions.security?.profils;
    }

    if (!layer.url && layer.sourceOptions.url) {
      layer.url = layer.sourceOptions.url;
    }
    if (!layer.type && layer.sourceOptions.type) {
      layer.type = layer.sourceOptions.type;
    }
    if (!layer.layers) {
      const params = layer.sourceOptions.params;
      layer.layers = params ? params.layers || params.LAYERS : undefined;
    }
    const localhost = ServerConfigs.localhost;
    const hosts = localhost ? localhost.hosts : [];
    const urlObj = URL.parse(layer.url || '');
    const url = urlObj ? urlObj.protocol + '//' + urlObj.hostname : '';
    if (url && hosts.indexOf(url) !== -1) {
      layer.url = urlObj.path;
    }

    return await Layer.create(layer);
  }

  public async update (id: string, layer: ILayer): Promise<{ id: string }> {
    if (!layer.url && layer.sourceOptions.url) {
      layer.url = layer.sourceOptions.url;
    }
    if (!layer.type && layer.sourceOptions.type) {
      layer.type = layer.sourceOptions.type;
    }
    if (!layer.layers) {
      const params = layer.sourceOptions.params;
      layer.layers = params ? params.layers || params.LAYERS : undefined;
    }

    const localhost = ServerConfigs.localhost;
    const hosts = localhost ? localhost.hosts : [];
    const urlObj = URL.parse(layer.url || '');
    const url = urlObj ? urlObj.protocol + '//' + urlObj.hostname : '';
    if (url && hosts.indexOf(url) !== -1) {
      layer.url = urlObj.path;
    }

    return await Layer
      .update(layer, {
        where: {
          id
        }
      })
      .then((count: [number]) => {
        if (!count[0]) {
          throw Boom.notFound();
        }
        return { id };
      });
  }

  public async delete (id: string): Promise<void> {
    return await Layer
      .destroy({
        where: {
          id
        }
      })
      .then((count: number) => {
        if (!count) {
          throw Boom.notFound();
        }
      });
  }

  public async get (): Promise<Layer[]> {
    return await Layer
      .findAll()
      .then((layers: Layer[]) => {
        const plainLayers = layers.map(layer =>
          ObjectUtils.removeNull(layer.get())
        );

        return plainLayers;
      });
  }

  public async getBaseLayers (): Promise<Layer[]> {
    return await Layer
      .findAll({
        where: {
          layerOptions: {
            baseLayer: true
          },
          enabled: true
        }
      })
      .then((layers: Layer[]) => {
        const plainLayers = layers.map(layer => {
          const plainLayer = layer.get();
          Object.assign(plainLayer, plainLayer.layerOptions);

          plainLayer.layerOptions = null;

          return ObjectUtils.removeNull(plainLayer);
        });
        // TODO verify permission
        return plainLayers;
      });
  }

  public async getById (id: string, user: string): Promise<Layer> {
    const layer = await Layer.findOne({
      where: {
        id,
        enabled: true
      }
    });
    if (!layer) {
      throw Boom.notFound();
    }
    const layerPlain = ObjectUtils.removeNull(layer.get());

    const profils: string[] = await UserApi.getProfils(user).catch(() => {
      return [];
    });
    profils.push(user);

    const isAllowed = layerPlain.profils.length ? layerPlain.profils.some(p => profils.includes(p)) : true;

    if (!isAllowed) {
      throw Boom.forbidden();
    }
    return layerPlain;
  }

  public async getByMatch (originalQ: string, type: string = 'layer', limit: number = 5, page: number = 1): Promise<Layer[]> {
    const q = originalQ
      .replace(/(\(|\)|\*)/g, ' ')
      .replace(/  +/g, ' ')
      .trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const term = (q + ':*').replace(/\s/g, ':*|');
    const layers = Layer.findAll({
      where: {
        enabled: true,
        searchableColumn: { [Op.match]: Layer.sequelize.fn('to_tsquery', term) }
      },
      offset: (page - 1) * limit,
      limit
    });
    return layers;
  }

  public async getFormattedLayersItemsByMatch (
    originalQ: string,
    type: string = 'Layer',
    limit: number = 5,
    page: number = 1,
    getInfoFromCapabilities: boolean = false
  ): Promise<{}> {
    const q = originalQ
      .replace(/(\(|\)|\*)/g, ' ')
      .replace(/  +/g, ' ')
      .trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const term = (q + ':*').replace(/\s/g, ':*|');
    const baseResponses = { items: [], maxScore: undefined };
    const processedUrl = [];

    const rawResults = await Layer.sequelize.query(`
    SELECT 
    ts_rank(:q, to_tsquery(:query)) AS rank,
    ts_headline('simple',coalesce(("layerOptions"->'title')::text, layers), to_tsquery(:query),'StartSel=<strong>, StopSel=</strong>' ),
    *
    FROM ${Layer.tableName}
    WHERE "searchableColumn" @@ to_tsquery(:query) and enabled = true
    ORDER BY rank DESC
    LIMIT :limit OFFSET :offset;
  `, {
      model: Layer,
      replacements: { q, query: term, limit, offset: (page - 1) * limit }
    });

    const wmsCapabilitiesPromises = [];
    rawResults.map(rawResult => {
      const layerItem: any = {};

      const plainRawResult: any = rawResult.get();

      const url = this.standardizeUrl(plainRawResult.url);
      const chain = plainRawResult.type + url + plainRawResult.layers;
      const id = Md5.hashStr(chain) as string;

      layerItem.score = plainRawResult.rank;
      layerItem.properties = {};
      layerItem.highlight = {};
      layerItem.properties.name = plainRawResult.layers;
      layerItem.properties.title = plainRawResult.layerOptions.title;
      layerItem.properties.abstract = plainRawResult.layerOptions.metadata?.abstract;
      layerItem.properties.keywords = plainRawResult.layerOptions.metadata?.keyword;
      layerItem.properties.metadataUrl = plainRawResult.layerOptions.metadata?.url;
      layerItem.properties.minScaleDenom = plainRawResult.layerOptions.minScaleDenom;
      layerItem.properties.maxScaleDenom = plainRawResult.layerOptions.maxScaleDenom;
      layerItem.properties.queryable = plainRawResult.sourceOptions?.queryable;
      layerItem.properties.optionsFromCapabilities = plainRawResult.sourceOptions?.optionsFromCapabilities;
      layerItem.properties.type = type;
      layerItem.properties.format = plainRawResult.type;
      layerItem.properties.url = plainRawResult.url;
      layerItem.properties.id = id;
      layerItem.highlight.title = plainRawResult.ts_headline;
      layerItem._layerOptions = plainRawResult.layerOptions;
      layerItem._sourceOptions = plainRawResult.sourceOptions;

      // THIS METHOD ONLY WORKS FOR WMS or ARCGIS LAYERS. TODO, Enable other types
      if (['wms', 'imagearcgisrest', 'tilearcgisrest', 'arcgisrest'].includes(plainRawResult.type)) {
        baseResponses.items.push(ObjectUtils.removeUndefined(layerItem));
      }

      // TODO enable other service capabilities
      if (getInfoFromCapabilities) {
        if (plainRawResult.url && plainRawResult.type === 'wms' && plainRawResult.sourceOptions?.optionsFromCapabilities !== false) {
          const localUrl = new URL.URL(plainRawResult.url);
          localUrl.searchParams.set('service', plainRawResult.type);
          localUrl.searchParams.set('request', 'getcapabilities');

          if (!processedUrl.includes(localUrl.href)) {
            processedUrl.push(localUrl.href);
            wmsCapabilitiesPromises.push(axios.get(localUrl.href));
          }
        }
      }
    });
    const wmsPromises = await Promise.all(wmsCapabilitiesPromises);
    const pgcs = {};
    for (const wms of wmsPromises) {
      const promiseUrl = wms.config.url;
      if (wms.data) {
        const gc = await this.getCapabilities(wms.data);
        const pgc = await this.parseWMSCapabilities(gc);
        pgcs[promiseUrl] = pgc;
      }
    }
    const pgcsKeys = Object.keys(pgcs);
    baseResponses.items.map(i => {
      if (i.score > baseResponses.maxScore) {
        baseResponses.maxScore = i.score;
      }
      const matchingGckey = pgcsKeys.find(pgcsk => pgcsk.includes(i.properties.url));
      if (matchingGckey && i.properties.optionsFromCapabilities !== false) {
        const matchingGcLayers = pgcs[matchingGckey];
        const matchingGcLayer = matchingGcLayers.find(gcLayer => gcLayer.name === i.properties.name);
        let newProperties = i.properties;
        if (matchingGcLayer) {
          if (!i._layerOptions.title) {
            i.highlight.title = matchingGcLayer.title;
          }
          newProperties = Object.assign(matchingGcLayer, i.properties);
        }
        i.properties = newProperties;
      }
    });
    return new Promise(function (resolve, reject) {
      resolve(ObjectUtils.removeUndefined(baseResponses));
    });
  }

  @PCacheable({
    maxCacheCount: 20,
    maxAge: 10 * 60 * 1000
  })
  private async getCapabilities (xml: string): Promise<any> {
    let getCapabilities;
    await xml2js.parseString(xml, (err: any, result) => {
      if (err) {
        throw Boom.badImplementation(err);
      }
      getCapabilities = result;
    });
    return getCapabilities;
  }

  private async parseWMSCapabilities (
    capabilities
  ): Promise<{}[]> {
    const data = [];
    const parse = async (layers, group) => {
      for (const layer of layers.Layer) {
        let queryable: boolean;
        if (layer.$) {
          queryable = !!Number(layer.$.queryable);
        }

        let metadata;
        if (layer.DataURL) {
          metadata = layer.DataURL[0].OnlineResource[0].$['xlink:href'];
        }

        const dataLayer: any = {
          name: layer.Name ? layer.Name[0] : undefined,
          title: layer.Title[0],
          abstract: layer.Abstract ? layer.Abstract[0] : undefined,
          keywords: layer.KeywordList ? layer.KeywordList[0].Keyword : [],
          minScaleDenom: layer.MinScaleDenominator ? layer.MinScaleDenominator[0] : undefined,
          maxScaleDenom: layer.MaxScaleDenominator ? layer.MaxScaleDenominator[0] : undefined,
          metadataUrl: metadata,
          queryable
        };
        dataLayer.groupName = group.name;
        dataLayer.groupTitle = group.title;
        dataLayer.type = layer.Layer && layer.Layer.length ? 'LayerGroup' : 'Layer';
        dataLayer.format = 'wms';
        data.push(dataLayer);

        if (layer.Layer && layer.Layer.length) {
          const groupT = Object.assign({}, group);
          groupT.name = dataLayer.name;
          groupT.title = dataLayer.title;
          await parse(layer, groupT);
        }
      }
    };
    if (capabilities.WMS_Capabilities) {
      await parse(capabilities.WMS_Capabilities.Capability[0], {});
    } else {
      console.log('\x1b[31m', 'ERREUR: Impossible de lire le présent service ', '\x1b[0m');
    }
    return data;
  }

  private standardizeUrl (url: string): string {
    const absUrl = url.charAt(0) === '/' ? window.location.origin + url : url;
    const urlDecomposed = absUrl.split(/[?&]/);
    let urlStandardized = urlDecomposed.shift();
    const paramsToKeep = urlDecomposed.filter(p => p.length !== 0 && p.charAt(0) !== '_');
    if (paramsToKeep.length) {
      urlStandardized += '?' + paramsToKeep.join('&');
    }
    return urlStandardized;
  }

  public async getBySource (layer: ILayer): Promise<Layer> {
    const localhost = ServerConfigs.localhost;
    const hosts = localhost ? localhost.hosts : [];
    layer.sourceOptions = layer.sourceOptions || { url: '', type: 'wms' };
    const urlObj = URL.parse(layer.sourceOptions.url || '');
    const url = urlObj ? urlObj.protocol + '//' + urlObj.hostname : '';
    if (url && hosts.indexOf(url) !== -1) {
      layer.sourceOptions.url = urlObj.path;
    }

    const where: any = {
      [Op.or]: [
        {
          type: layer.sourceOptions.type,
          url: layer.sourceOptions.url || null,
          layers: (layer.sourceOptions.params || {}).layers || (layer.sourceOptions.params || {}).LAYERS || null
        }
      ],
      [Op.and]: [layer.enabled]
    };
    if (layer.id) {
      where[Op.or].unshift({ id: layer.id });
    }

    return await Layer
      .findOne({
        where
      })
      .then((layerFound: Layer) => {
        if (!layerFound) {
          throw Boom.notFound();
        }
        return ObjectUtils.removeNull(layerFound.get());
      });
  }
}
