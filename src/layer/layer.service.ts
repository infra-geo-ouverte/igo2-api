import { StringArray } from '@igo2/fastify';
import { and, eq, isNull, or, sql } from 'drizzle-orm';
import Value from 'typebox/value';

import { AppDatabase, AppInstance } from '../app.interface';
import { IProfils } from '../auth';
import { Transaction } from '../core/database';
import { KeyPath } from '../utils/object';
import {
  AnySourceOptionsParams,
  ILayer,
  ILayerIn,
  ILayerMigrateBatch,
  LayerOptions,
  LayerType,
  SourceOptions
} from './layer.interface';
import { layerModel } from './layer.model';
import { ILayerPermission } from './permission';
import { LayerWss } from './permission/layer-wss';
import {
  convertLayerToOptions,
  getParamsLayers,
  isLayerItemOptions,
  resolveUrl,
  sanitizeLayerSourceOptions
} from './utils/layer.utils';

type IQueryBySourceOptions = Pick<SourceOptions, 'type' | 'url'> & {
  params?: Pick<AnySourceOptionsParams, 'layers'>;
};

// Used to indicate which key is use in the layer table and should be ignore for LayerContext.sourceOptions
export const LayerSourceKeys: KeyPath<SourceOptions>[] = [
  'type',
  'url',
  'params'
];

export class LayerService {
  private layerPermission?: ILayerPermission;
  private layerWss: LayerWss;
  private db: AppDatabase;

  constructor(private app: AppInstance) {
    this.layerPermission = this.app.layerPermission;
    this.layerWss = new LayerWss(app);
    this.db = app.db;
  }

  get hosts() {
    return Value.Decode(StringArray(), this.app.env.OGC_WSS_HOSTS);
  }

  async create(
    layerData: ILayerIn,
    transaction?: Transaction
  ): Promise<ILayer> {
    const dbInstance = transaction ?? this.db;
    const data: ILayerIn = {
      ...layerData,
      sourceOptions: layerData.sourceOptions
        ? sanitizeLayerSourceOptions(
            layerData.sourceOptions as Partial<SourceOptions>
          )
        : layerData.sourceOptions
    };
    const [result] = await dbInstance
      .insert(layerModel)
      .values(data)
      .returning();
    return result;
  }

  async update(id: number, layerData: Partial<ILayerIn>): Promise<ILayer> {
    const data: Partial<ILayerIn> = {
      ...layerData,
      sourceOptions:
        layerData.sourceOptions != null
          ? sanitizeLayerSourceOptions(
              layerData.sourceOptions as Partial<SourceOptions>
            )
          : layerData.sourceOptions
    };
    const [result] = await this.db
      .update(layerModel)
      .set(data)
      .where(eq(layerModel.id, id))
      .returning();
    return result;
  }

  async delete(id: number): Promise<number> {
    const result = await this.db
      .delete(layerModel)
      .where(eq(layerModel.id, id));
    return result.rowCount ?? 0;
  }

  async getAll(): Promise<ILayer[]> {
    return this.db.select().from(layerModel);
  }

  async getAllGlobal(): Promise<ILayer[]> {
    return this.db.select().from(layerModel).where(eq(layerModel.global, true));
  }

  async getBaseLayers(): Promise<ILayer[]> {
    const layers = await this.db
      .select()
      .from(layerModel)
      .where(sql`${layerModel.layerOptions}->>'baseLayer' = 'true'`);

    return layers.map((l) => {
      const plainLayer = { ...l };
      Object.assign(plainLayer, plainLayer.layerOptions);
      plainLayer.layerOptions = null;
      return plainLayer;
    });
  }

  async getById(id: number): Promise<ILayer | undefined> {
    const [result] = await this.db
      .select()
      .from(layerModel)
      .where(eq(layerModel.id, id));
    return result || undefined;
  }

  async getByIdWithPermission(
    id: number,
    profils: IProfils
  ): Promise<ILayer | undefined> {
    const layerResult = await this.getById(id);
    if (!layerResult) {
      return undefined;
    }

    await this.urlAllowed(layerResult.url, profils);

    return layerResult;
  }

  async getBySource(
    options: IQueryBySourceOptions,
    layerId?: number
  ): Promise<ILayer | undefined> {
    const resolvedUrl = resolveUrl(options.url, this.app.env.WSS_API);
    const params = options.params as AnySourceOptionsParams;
    const layerName = params?.layers ?? params?.['LAYERS'];

    const conditions = [
      and(
        eq(layerModel.type, options.type),
        eq(layerModel.url, resolvedUrl),
        layerName ? eq(layerModel.layers, layerName) : isNull(layerModel.layers)
      )
    ];

    if (layerId && typeof layerId === 'number') {
      conditions.unshift(sql`${layerModel.id} = ${layerId}`);
    }

    const [result] = await this.db
      .select()
      .from(layerModel)
      .where(or(...conditions));

    return result || undefined;
  }

  /**
   * Try to get the layer by source options or create if it doesn't exist
   */
  async getLayerOrCreate(
    layerId: number | undefined,
    sourceOptions: SourceOptions,
    transaction?: Transaction
  ): Promise<ILayer | undefined> {
    if (sourceOptions.url === undefined) {
      throw this.app.httpErrors.badRequest('SourceOptions url is required');
    }

    const layerDB = await this.getBySource(sourceOptions, layerId);
    if (layerDB) {
      return layerDB;
    }

    return this.create(
      {
        type: sourceOptions.type as LayerType,
        url: sourceOptions.url,
        layers: getParamsLayers(sourceOptions)
      },
      transaction
    );
  }

  async getOptions(
    type: LayerType,
    layers: string | undefined,
    url: string
  ): Promise<LayerOptions | undefined> {
    const layerResult = await this.getBySource({
      type,
      url,
      params: {
        layers: layers
      }
    });
    if (!layerResult) {
      throw this.app.httpErrors.notFound(
        'Layer not found by source',
        type,
        layers ?? 'No layer name',
        url
      );
    }

    const options = convertLayerToOptions(layerResult);
    return this.setWssOptions(options, url);
  }

  async urlAllowed(url: string, profils: IProfils): Promise<void> {
    if (!this.layerPermission) {
      return;
    }

    const resolvedUrl = resolveUrl(url, this.app.env.WSS_API);
    const hasAccess = await this.layerPermission.verifyPermissionByUrl(
      resolvedUrl,
      profils
    );
    if (!hasAccess) {
      console.error('LayerService - has no access', resolvedUrl, profils);
      throw this.app.httpErrors.forbidden();
    }

    return;
  }

  async setWssOptions(
    layer: LayerOptions,
    url: string | undefined
  ): Promise<LayerOptions> {
    if (layer.type === 'wms' && isLayerItemOptions(layer)) {
      return this.layerWss.setWssOptions(layer, url);
    }

    return layer;
  }

  async migrateBatch(request: ILayerMigrateBatch): Promise<void> {
    return this.app.db.transaction(async (tx) => {
      const operations: Promise<unknown>[] = [];

      if (request.toAdd) {
        for (const layer of request.toAdd) {
          const existingLayer = await this.getBySource({
            type: layer.type,
            url: layer.url,
            params: { layers: layer.layers }
          });
          if (existingLayer) {
            throw this.app.httpErrors.badRequest(
              `Le layer que vous tentez de créer existe déjà, voir le id: ${existingLayer.id}. Payload: ${layer}`
            );
          }
          operations.push(this.create(layer, tx));
        }
      }

      if (request.toPut) {
        for (const payload of request.toPut) {
          const { id, ...values } = payload;
          const sanitizedValues = {
            ...values,
            sourceOptions:
              values.sourceOptions != null
                ? sanitizeLayerSourceOptions(
                    values.sourceOptions as Partial<SourceOptions>
                  )
                : values.sourceOptions
          };
          operations.push(
            tx
              .update(layerModel)
              .set(sanitizedValues)
              .where(sql`${layerModel.id} = ${id}`)
          );
        }
      }

      await Promise.all(operations);
    });
  }

  async migrateLayer(layer: ILayerIn): Promise<ILayer> {
    const { id: _id, type, url, layers, ...values } = layer;
    const existingLayer = await this.getBySource({
      type,
      url,
      params: { layers }
    });

    return existingLayer
      ? this.update(existingLayer.id, values)
      : this.create(layer);
  }
}
