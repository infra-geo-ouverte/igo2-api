import { createHash, randomBytes } from 'node:crypto';

import { StringArray } from '@igo2/fastify';
import { and, desc, eq, isNull, or, sql } from 'drizzle-orm';
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
  ILayerSearchItem,
  ILayerSearchResult,
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

const HIGHLIGHT_TOKEN_NONCE = randomBytes(12).toString('hex');
const HIGHLIGHT_START_TOKEN = `__IGO_HIGHLIGHT_${HIGHLIGHT_TOKEN_NONCE}_START__`;
const HIGHLIGHT_END_TOKEN = `__IGO_HIGHLIGHT_${HIGHLIGHT_TOKEN_NONCE}_END__`;
const HIGHLIGHT_HEADLINE_OPTIONS = `StartSel=${HIGHLIGHT_START_TOKEN}, StopSel=${HIGHLIGHT_END_TOKEN}`;

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

  async search(
    originalQuery: string,
    type: 'layer' | 'group' = 'layer',
    profils: IProfils,
    limit = 10,
    page = 1
  ): Promise<ILayerSearchResult> {
    const toTextSearchString = (term: string): string => {
      return term
        .split(' ')
        .filter(Boolean)
        .map((word) => `${word}:*`)
        .join(' | ');
    };
    const normalizedQuery = this.normalizeSearchQuery(originalQuery);
    if (!normalizedQuery) {
      return { items: [] };
    }
    const tsQuery = toTextSearchString(normalizedQuery);
    const tsQuerySql = sql`to_tsquery('simple', unaccent(${tsQuery}))`;

    const authorizedOffset = (page - 1) * limit;
    const batchSize = Math.max(limit, 20);
    const searchDocument = sql<string>`
      to_tsvector(
        'simple',
        concat_ws(
          ' ',
          coalesce(${layerModel.layers}, ''),
          coalesce(${layerModel.url}, ''),
          coalesce(${layerModel.type}::text, ''),
          coalesce(unaccent(${layerModel.layerOptions}->>'title'), ''),
          coalesce(${layerModel.layerOptions}->>'name', ''),
          coalesce(unaccent(${layerModel.layerOptions}->'metadata'->>'abstract'), ''),
          coalesce(unaccent(${layerModel.layerOptions}->'metadata'->>'keyword'), '')
        )
      )
    `;
    const rank = sql<number>`ts_rank(${searchDocument}, ${tsQuerySql})`;
    const headline = sql<string>`
      ts_headline(
        'simple',
        coalesce(${layerModel.layerOptions}->>'title', ${layerModel.layers}, ''),
        to_tsquery('simple', ${toTextSearchString(originalQuery)}),
        ${HIGHLIGHT_HEADLINE_OPTIONS}
      )
    `;
    const typeFilter =
      type === 'group'
        ? sql`${layerModel.type} = 'group'`
        : sql`${layerModel.type} <> 'group'`;

    let scannedOffset = 0;
    let skippedAuthorized = 0;
    const authorizedRows: {
      id: number;
      type: LayerType;
      url: string;
      layers: string | null;
      layerOptions: ILayer['layerOptions'];
      sourceOptions: ILayer['sourceOptions'];
      score: number;
      headline: string;
    }[] = [];

    while (authorizedRows.length < limit) {
      const rows = await this.db
        .select({
          id: layerModel.id,
          type: layerModel.type,
          url: layerModel.url,
          layers: layerModel.layers,
          layerOptions: layerModel.layerOptions,
          sourceOptions: layerModel.sourceOptions,
          score: rank,
          headline: headline
        })
        .from(layerModel)
        .where(and(typeFilter, sql`${searchDocument} @@ ${tsQuerySql}`))
        .orderBy(desc(rank))
        .limit(batchSize)
        .offset(scannedOffset);

      if (rows.length === 0) {
        break;
      }

      scannedOffset += rows.length;

      const visibleRows = await this.filterAuthorizedRows(rows, profils);
      const remainingToSkip = Math.max(authorizedOffset - skippedAuthorized, 0);
      const pagedRows =
        remainingToSkip > 0 ? visibleRows.slice(remainingToSkip) : visibleRows;

      skippedAuthorized += Math.min(remainingToSkip, visibleRows.length);
      authorizedRows.push(...pagedRows.slice(0, limit - authorizedRows.length));

      if (rows.length < batchSize) {
        break;
      }
    }

    const items = authorizedRows.map((row) => this.mapSearchRow(row, type));

    return {
      items,
      maxScore:
        items.length > 0
          ? Math.max(...items.map((item) => item.score))
          : undefined
    };
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

  private async filterAuthorizedRows<TRow extends { url: string }>(
    rows: TRow[],
    profils: IProfils
  ): Promise<TRow[]> {
    const visibleRows = await Promise.all(
      rows.map(async (row) => {
        try {
          await this.urlAllowed(row.url, profils);
          return row;
        } catch {
          return undefined;
        }
      })
    );

    return visibleRows.reduce<TRow[]>((authorized, row) => {
      if (row) {
        authorized.push(row);
      }

      return authorized;
    }, []);
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

  private normalizeSearchQuery(query: string): string {
    return query
      .replaceAll(/(\(|\)|\*)/g, ' ')
      .replaceAll(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  private mapSearchRow(
    row: {
      id: number;
      type: LayerType;
      url: string;
      layers: string | null;
      layerOptions: ILayer['layerOptions'];
      sourceOptions: ILayer['sourceOptions'];
      score: number;
      headline: string;
    },
    type: 'layer' | 'group'
  ): ILayerSearchItem {
    const layerOptions =
      row.layerOptions && typeof row.layerOptions === 'object'
        ? (row.layerOptions as Record<string, unknown>)
        : {};
    const sourceOptions =
      row.sourceOptions && typeof row.sourceOptions === 'object'
        ? (row.sourceOptions as Record<string, unknown>)
        : {};
    const metadata =
      layerOptions['metadata'] && typeof layerOptions['metadata'] === 'object'
        ? (layerOptions['metadata'] as Record<string, unknown>)
        : {};
    const title = this.getOptionalString(layerOptions['title']);
    const fallbackHighlightTitle = title ?? row.layers ?? undefined;
    const identifier = createHash('md5')
      .update(`${row.type}${row.url}${row.layers ?? ''}`)
      .digest('hex');

    return {
      score: row.score,
      properties: {
        name: row.layers ?? undefined,
        title,
        abstract: this.getOptionalString(metadata['abstract']),
        keywords: this.getOptionalStringArray(metadata['keyword']),
        metadataUrl: this.getOptionalString(metadata['url']),
        minScaleDenom: this.getOptionalNumber(layerOptions['minScaleDenom']),
        maxScaleDenom: this.getOptionalNumber(layerOptions['maxScaleDenom']),
        queryable: this.getOptionalBoolean(sourceOptions['queryable']),
        optionsFromCapabilities: this.getOptionalBoolean(
          sourceOptions['optionsFromCapabilities']
        ),
        type,
        format: row.type,
        url: row.url,
        sourceId: row.id,
        id: identifier
      },
      highlight: {
        title: this.formatHighlightTitle(row.headline || fallbackHighlightTitle)
      }
    };
  }

  private formatHighlightTitle(value: string | undefined): string | undefined {
    if (!value) {
      return undefined;
    }

    return this.escapeHtml(value)
      .replaceAll(HIGHLIGHT_START_TOKEN, '<strong>')
      .replaceAll(HIGHLIGHT_END_TOKEN, '</strong>');
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  private getOptionalString(value: unknown): string | undefined {
    return typeof value === 'string' && value.length > 0 ? value : undefined;
  }

  private getOptionalNumber(value: unknown): number | undefined {
    return typeof value === 'number' ? value : undefined;
  }

  private getOptionalBoolean(value: unknown): boolean | undefined {
    return typeof value === 'boolean' ? value : undefined;
  }

  private getOptionalStringArray(value: unknown): string[] | undefined {
    return Array.isArray(value) &&
      value.every((item) => typeof item === 'string')
      ? value
      : undefined;
  }
}
