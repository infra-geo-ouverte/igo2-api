import { Transaction } from '../../core/database/database.interface';
import {
  LayerTree,
  convertLayerContextToOptions,
  isLayerGroupOptions,
  isLayerItemOptions
} from '../../layer';
import {
  AnyLayerOptions,
  LayerGroupOptions,
  LayerOptions
} from '../../layer/layer.interface';
import { LayerService } from '../../layer/layer.service';
import { IProcessChanges } from '../../utils/request';
import { getAncestorId } from '../../utils/tree/tree.utils';
import { parseLayerToContextLayer } from './context-layer';
import {
  IContextLayer,
  IContextLayerWithId,
  IUpsertResponse
} from './context-layer.interface';
import { ContextLayerService } from './context-layer.service';

export class ContextLayerModify {
  private previousLayers!: IContextLayer[];
  private changes: IProcessChanges<IContextLayer>;

  constructor(
    private contextLayerService: ContextLayerService,
    private layerSerive: LayerService
  ) {
    this.changes = {
      created: [],
      updated: [],
      deleted: []
    };
  }

  public async modify(
    contextId: number,
    layers: AnyLayerOptions[],
    transaction: Transaction
  ): Promise<IProcessChanges<AnyLayerOptions>> {
    this.previousLayers =
      await this.contextLayerService.getByContextId(contextId);

    if (layers?.length) {
      this.validateLayers(layers);

      await this.bulkUpsert(contextId, layers, transaction);

      const ids = this.findMissingIds(this.previousLayers, layers);
      await this.contextLayerService.bulkDelete(contextId, ids, transaction);
      this.changes.deleted.push(...ids);
    } else {
      await this.contextLayerService.deleteByContextId(contextId, transaction);
    }

    return {
      created: this.changes.created.map((contextLayer) =>
        convertLayerContextToOptions(contextLayer)
      ),
      updated: this.changes.updated.map((contextLayer) =>
        convertLayerContextToOptions(contextLayer)
      ),
      deleted: this.changes.deleted
    };
  }

  /**
   * Validate the provided layers tree for duplicate ids and circular references.
   * Throws an Error when a problem is detected.
   */
  private validateLayers(layers: AnyLayerOptions[]): void {
    const seenIds = new Set<number>();
    const visited = new Set<AnyLayerOptions>();

    const dfs = (node: AnyLayerOptions, stack: Set<AnyLayerOptions>) => {
      // Detect circular object references by tracking current DFS stack
      if (stack.has(node)) {
        throw new Error('Circular reference detected in layers');
      }

      // If we've fully visited this node before (from another branch), skip
      if (visited.has(node)) {
        return;
      }

      stack.add(node);

      // Check duplicate numeric ids
      if (node.id && typeof node.id === 'number') {
        if (seenIds.has(node.id)) {
          throw new Error(`Duplicate layer id ${node.id} found in layers`);
        }
        seenIds.add(node.id);
      }

      visited.add(node);

      if (isLayerGroupOptions(node) && node.children?.length) {
        for (const child of node.children) {
          dfs(child, stack);
        }
      }

      stack.delete(node);
    };

    for (const root of layers) {
      dfs(root, new Set<AnyLayerOptions>());
    }
  }

  private async bulkUpsert(
    contextId: number,
    layers: AnyLayerOptions[],
    transaction?: Transaction
  ): Promise<void> {
    const promises = layers.map((layer) =>
      this.upsertAnyLayerContext(layer, contextId, transaction)
    );
    await Promise.all(promises);
  }

  private async upsertLayerContext(
    layer: LayerOptions,
    contextId: number,
    transaction?: Transaction
  ): Promise<IUpsertResponse | undefined> {
    const previousContextLayer = this.isExisting(layer);

    const layerDB = await this.layerSerive.getLayerOrCreate(
      previousContextLayer?.layerId ?? layer.id,
      layer.sourceOptions!,
      transaction
    );
    if (layerDB?.global && !layer.visible) {
      return;
    }

    if (!previousContextLayer) {
      layer.id = undefined;
    }

    const contextLayer = parseLayerToContextLayer(
      layer,
      contextId,
      layerDB?.id
    );
    const [contextLayerDb, _created] = await this.contextLayerService.upsert(
      contextLayer,
      transaction
    );
    return [contextLayerDb, !previousContextLayer];
  }

  private async upsertLayerContextGroup(
    { children, ...layer }: LayerGroupOptions,
    contextId: number,
    transaction?: Transaction
  ): Promise<void> {
    const isExisting = this.isExisting(layer);
    if (!isExisting) {
      layer.id = undefined;
    }

    const contextLayer = parseLayerToContextLayer(layer, contextId);
    const [layerContextDb] = await this.contextLayerService.upsert(
      contextLayer,
      transaction
    );

    this.changes[isExisting ? 'updated' : 'created'].push(layerContextDb);

    if (children?.length) {
      children.forEach((child) => {
        child.parentId = this.getParentId(
          layerContextDb as IContextLayerWithId
        );
      });

      await this.bulkUpsert(contextId, children, transaction);
    }
  }

  private isExisting(layer: AnyLayerOptions): IContextLayer | undefined {
    return layer.id
      ? this.previousLayers.find(
          (previousLayer) => previousLayer.id === layer.id
        )
      : undefined;
  }

  private async upsertAnyLayerContext(
    layer: AnyLayerOptions,
    contextId: number,
    transaction?: Transaction
  ): Promise<void> {
    if (isLayerItemOptions(layer)) {
      const response = await this.upsertLayerContext(
        layer,
        contextId,
        transaction
      );
      if (response) {
        const [contextLayer, created] = response;
        this.changes[created ? 'created' : 'updated'].push(contextLayer);
      }
    } else if (isLayerGroupOptions(layer)) {
      await this.upsertLayerContextGroup(layer, contextId, transaction);
    }
  }

  private getParentId(layerContext: IContextLayerWithId): string {
    return getAncestorId(layerContext.id, layerContext.layerOptions?.parentId);
  }

  private findMissingIds(
    contextLayers: IContextLayer[],
    layers: AnyLayerOptions[]
  ): number[] {
    const tree = new LayerTree(layers);
    const bIds = new Set(tree.flattened.map((item) => item.id));

    const missingItems = contextLayers.filter((item) => !bIds.has(item.id));
    return missingItems.map((item) => item.id).filter(Boolean) as number[];
  }
}
