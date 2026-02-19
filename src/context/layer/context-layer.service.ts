import { DrizzleQueryError, and, eq, inArray, sql } from 'drizzle-orm';

import { AppDatabase, AppInstance } from '../../app.interface';
import { IProfils } from '../../auth';
import { Transaction } from '../../core/database/database.interface';
import {
  AnyLayerOptions,
  AnyLayerOptionsOut,
  AnyLayerOptionsWithLayerId,
  ILayer,
  LayerGroupOptions,
  LayerOptions,
  LayerService,
  LayerTree,
  convertLayerContextToOptions,
  convertLayerToOptions,
  isLayerGroupOptions,
  isLayerItemOptions
} from '../../layer';
import { IProcessChanges } from '../../utils/request';
import { getAncestorId } from '../../utils/tree/tree.utils';
import { parseLayerToContextLayer } from './context-layer';
import { ContextLayerModify } from './context-layer-modify';
import {
  IContextLayer,
  IContextLayerIn,
  IContextLayerWithRelations,
  IContextLayerWithoutMeta,
  IUpsertResponse
} from './context-layer.interface';
import { contextLayerModel } from './context-layer.model';
import { mergeLayerContext } from './context-layer.utils';

export class ContextLayerService {
  private layerService: LayerService;
  private db: AppDatabase;

  constructor(private app: AppInstance) {
    this.db = app.db;

    this.layerService = new LayerService(app);
  }

  async create(
    ctxLayerIn: IContextLayerIn,
    transaction?: Transaction
  ): Promise<IContextLayer> {
    try {
      const dbInstance = transaction || this.db;
      const [response] = await dbInstance
        .insert(contextLayerModel)
        .values(ctxLayerIn)
        .returning();

      return response;
    } catch (error) {
      if (error instanceof DrizzleQueryError) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const code = (error?.cause as any)?.code;
        if (code === '23505') {
          const message = 'The pair contextId and layerId must be unique.';
          throw this.app.httpErrors.conflict(message);
        }
      }
      throw error;
    }
  }

  async update(
    id: number,
    layerContext: IContextLayerIn
  ): Promise<IContextLayer | undefined> {
    const [response] = await this.db
      .update(contextLayerModel)
      .set(layerContext)
      .where(eq(contextLayerModel.id, id))
      .returning();

    return response;
  }

  async upsert(
    layerContext: IContextLayerWithoutMeta,
    transaction?: Transaction
  ): Promise<IUpsertResponse> {
    const dbInstance = transaction || this.db;

    if (layerContext.id != null) {
      const [value] = await dbInstance
        .update(contextLayerModel)
        .set(layerContext)
        .where(eq(contextLayerModel.id, layerContext.id))
        .returning();
      return [value, false];
    } else {
      const [value] = await dbInstance
        .insert(contextLayerModel)
        .values(layerContext)
        .returning();
      return [value, true];
    }
  }

  /**
   * Handle create, update and delete for hard update
   */
  async modify(
    contextId: number,
    layers: AnyLayerOptions[],
    transaction: Transaction
  ): Promise<IProcessChanges<AnyLayerOptions>> {
    return new ContextLayerModify(this, this.layerService).modify(
      contextId,
      layers,
      transaction
    );
  }

  async cloneByContextId(
    id: number,
    newId: number,
    transaction: Transaction
  ): Promise<(IContextLayer | IContextLayer[])[]> {
    const layers = await this.getByContextId(id);

    const layersOptions = layers.map((layer) => {
      const options = convertLayerContextToOptions(layer);
      return {
        ...options,
        layerId: layer.layerId!
      } satisfies AnyLayerOptionsWithLayerId;
    });

    const tree = new LayerTree<AnyLayerOptionsWithLayerId>().fromFlatList(
      layersOptions
    );
    return this.bulkClone(newId, tree.data, transaction);
  }

  async delete(id: number): Promise<number> {
    const result = await this.db
      .delete(contextLayerModel)
      .where(and(eq(contextLayerModel.id, id)));
    return result.rowCount ?? 0;
  }

  async deleteByContextId(
    contextId: number,
    transaction: Transaction
  ): Promise<number> {
    const dbInstance = transaction || this.db;
    const result = await dbInstance
      .delete(contextLayerModel)
      .where(eq(contextLayerModel.contextId, contextId));
    return result.rowCount ?? 0;
  }

  async bulkDelete(
    contextId: number,
    ids: number[],
    transaction: Transaction
  ): Promise<number> {
    const dbInstance = transaction || this.db;
    const result = await dbInstance
      .delete(contextLayerModel)
      .where(
        and(
          eq(contextLayerModel.contextId, contextId),
          inArray(contextLayerModel.id, ids)
        )
      );
    return result.rowCount ?? 0;
  }

  async getByContextId(contextId: number): Promise<IContextLayer[]> {
    const layerContexts = await this.db
      .select()
      .from(contextLayerModel)
      .where(eq(contextLayerModel.contextId, contextId))
      .orderBy(sql`${contextLayerModel.layerOptions}->>'zIndex'`);

    return layerContexts;
  }

  async getById(id: number): Promise<IContextLayer | undefined> {
    const [layerData] = await this.db
      .select()
      .from(contextLayerModel)
      .where(eq(contextLayerModel.id, id));
    return layerData;
  }

  async bulkCreate(
    contextId: number,
    layers: AnyLayerOptions[],
    transaction?: Transaction
  ): Promise<IContextLayer[]> {
    const promises = layers.map((layer) => {
      const { id: _id, ...value } = layer;
      return this.createAnyLayerContext(value, contextId, transaction);
    });
    const results = await Promise.all(promises);
    return results.flat(10) as IContextLayer[];
  }

  async formatLayersToOptions(
    layers: IContextLayerWithRelations[],
    profils: IProfils,
    globalLayers: ILayer[]
  ): Promise<AnyLayerOptionsOut[]> {
    const globalLayersWithSourceOptions = globalLayers.map((layer) =>
      convertLayerToOptions(layer)
    );

    const processedOptions = await Promise.all([
      ...globalLayersWithSourceOptions.map((raw) =>
        this.processLayer(raw, profils, true)
      ),
      ...layers.map((ctxLayer) => {
        const layer = mergeLayerContext(ctxLayer);
        return this.processLayer(layer, profils, false);
      })
    ]);

    const validOptions = processedOptions.filter(
      (opt): opt is AnyLayerOptionsOut => !!opt
    );

    return new LayerTree<AnyLayerOptionsOut>().fromFlatList(validOptions).data;
  }

  private async processLayer(
    layer: AnyLayerOptionsOut,
    profils: IProfils,
    isGlobal = false
  ): Promise<AnyLayerOptionsOut | null> {
    const hasPermission = await this.validateLayerPermissions(layer, profils);
    if (!hasPermission) return null;

    if (this.shouldApplyWss(layer, isGlobal)) {
      const options = await this.layerService.setWssOptions(layer, undefined);
      return options as AnyLayerOptionsOut;
    }

    return layer;
  }

  private shouldApplyWss(options: AnyLayerOptions, isGlobal: boolean): boolean {
    return (
      !isGlobal &&
      isLayerItemOptions(options) &&
      options.sourceOptions?.type === 'wms'
    );
  }

  private async validateLayerPermissions(
    layer: AnyLayerOptions,
    profils: IProfils
  ): Promise<boolean> {
    if (isLayerGroupOptions(layer) || !layer.sourceOptions?.url) {
      return true;
    }

    return this.layerService.urlAllowed(layer.sourceOptions.url, profils);
  }

  private async bulkClone(
    contextId: number,
    layers: AnyLayerOptionsWithLayerId[],
    transaction?: Transaction
  ): Promise<(IContextLayer | IContextLayer[])[]> {
    const promises = layers.map((layer) =>
      this.cloneAnyLayerContext(layer, contextId, transaction)
    );
    return Promise.all(promises);
  }

  private async cloneAnyLayerContext(
    layer: AnyLayerOptionsWithLayerId,
    contextId: number,
    transaction?: Transaction
  ): Promise<IContextLayer | IContextLayer[]> {
    return layer.type === 'group'
      ? this.cloneLayerContextGroup(
          layer as LayerGroupOptions,
          contextId,
          transaction
        )
      : this.cloneLayerContext(layer, contextId, transaction);
  }

  private async cloneLayerContext(
    {
      id: _id,
      layerId,
      sourceOptions,
      ...layerData
    }: LayerOptions & { layerId: number },
    contextId: number,
    transaction?: Transaction
  ): Promise<IContextLayer> {
    const layerContext: IContextLayerIn = {
      layerId,
      layerOptions: layerData,
      sourceOptions: sourceOptions ?? null,
      contextId: contextId
    };

    return this.create(layerContext, transaction);
  }

  private async cloneLayerContextGroup(
    { id: _id, children, ...layerData }: LayerGroupOptions,
    contextId: number,
    transaction?: Transaction
  ): Promise<IContextLayer | IContextLayer[]> {
    const ctxLayer: IContextLayerIn = {
      contextId: contextId,
      layerId: null,
      layerOptions: layerData,
      sourceOptions: null
    };
    const layerContextDb = await this.create(ctxLayer, transaction);

    if (children?.length) {
      children.forEach((child) => {
        child.parentId = this.getParentId(layerContextDb);
      });

      await this.bulkClone(
        contextId,
        children as AnyLayerOptionsWithLayerId[],
        transaction
      );
    }

    return layerContextDb;
  }

  private async createAnyLayerContext(
    layerData: AnyLayerOptions,
    contextId: number,
    transaction?: Transaction
  ): Promise<IContextLayer | undefined | IContextLayer[]> {
    if (isLayerItemOptions(layerData)) {
      return this.createLayerContext(layerData, contextId, transaction);
    } else if (isLayerGroupOptions(layerData)) {
      return this.createLayerContextGroup(layerData, contextId, transaction);
    }
    return this.createLayerContext(layerData, contextId, transaction);
  }

  private async createLayerContext(
    layerData: LayerOptions,
    contextId: number,
    transaction?: Transaction
  ): Promise<IContextLayer | undefined> {
    const layerDB = await this.layerService.getLayerOrCreate(
      layerData.id,
      layerData.sourceOptions!,
      transaction
    );
    if (layerDB?.global && !layerData.visible) {
      return;
    }

    const layerContext = parseLayerToContextLayer(
      layerData,
      contextId,
      layerDB?.id
    );
    return this.create(layerContext, transaction);
  }

  private async createLayerContextGroup(
    { children, id: _id, ...restLayer }: LayerGroupOptions,
    contextId: number,
    transaction?: Transaction
  ): Promise<IContextLayer | IContextLayer[]> {
    const layerContext = parseLayerToContextLayer(restLayer, contextId);
    const layerContextDb = await this.create(layerContext, transaction);

    if (children?.length) {
      children.forEach((child) => {
        child.parentId = this.getParentId(layerContextDb);
      });

      const created = await this.bulkCreate(contextId, children, transaction);

      return [layerContextDb, ...created];
    }

    return layerContextDb;
  }

  private getParentId(ctxLayer: IContextLayer): string {
    return getAncestorId(ctxLayer.id, ctxLayer.layerOptions?.parentId);
  }
}
