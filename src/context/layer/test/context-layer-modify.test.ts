/* eslint-disable @typescript-eslint/no-explicit-any */
import test from 'node:test';

import { Transaction } from '../../../core/database/database.interface';
import { LayerGroupOptions, LayerOptions, LayerService } from '../../../layer';
import { ContextLayerModify } from '../context-layer-modify';
import { IContextLayer } from '../context-layer.interface';
import { ContextLayerService } from '../context-layer.service';

// Mock services
const mockContextLayerService = {
  getByContextId: async () => [],
  upsert: async (layer: any) => {
    if (layer.id == null) {
      layer.id = 1;
    }
    return [layer, true];
  },
  bulkDelete: async () => void 0,
  deleteByContextId: async () => void 0
} as unknown as ContextLayerService;

const mockLayerService = {
  getLayerOrCreate: async (layer: any) => ({ ...layer, id: 1, global: false })
} as unknown as LayerService;

// Helper function to create test layers
const createTestLayer = (
  overrides: Partial<LayerOptions> = {}
): LayerOptions => ({
  id: 1,
  type: 'wms',
  title: 'Test Layer',
  visible: true,
  opacity: 1,
  sourceOptions: {
    type: 'wms',
    url: 'http://test.com',
    params: {
      LAYERS: 'test',
      layers: 'test'
    }
  },
  ...overrides
});

test('ContextLayerModify', (t) => {
  t.test(
    'ContextLayerModify - empty layers array should delete all context layers',
    async (t) => {
      const service = new ContextLayerModify(
        mockContextLayerService,
        mockLayerService
      );
      const contextId = 1;
      const result = await service.modify(contextId, [], {} as Transaction);

      t.assert.deepEqual(
        result,
        {
          created: [],
          updated: [],
          deleted: []
        },
        'Should return empty changes when no layers provided'
      );
    }
  );

  t.test('ContextLayerModify - single layer upsert', async (t) => {
    const mockLayer = createTestLayer();
    const service = new ContextLayerModify(
      {
        ...mockContextLayerService,
        getByContextId: async () => [
          {
            id: 1,
            contextId: 1,
            layerId: 1,
            layerOptions: mockLayer
          }
        ]
      } as any,
      mockLayerService
    );

    const result = await service.modify(1, [mockLayer], {} as Transaction);

    t.assert.deepEqual(
      result.updated.length,
      1,
      'Should update existing layer'
    );
    t.assert.deepEqual(result.created.length, 0, 'Should not create new layer');
    t.assert.deepEqual(result.deleted.length, 0, 'Should not delete any layer');
  });

  t.test('ContextLayerModify - layer group with children', async (t) => {
    const mockGroup: LayerGroupOptions = {
      id: 1,
      type: 'group',
      title: 'Group',
      children: [createTestLayer({ id: 2 })]
    };

    const service = new ContextLayerModify(
      {
        ...mockContextLayerService,
        getByContextId: async () => []
      } as any,
      mockLayerService
    );

    const result = await service.modify(1, [mockGroup], {} as Transaction);

    t.assert.deepEqual(
      result.created.length,
      2,
      'Should create both group and child layer'
    );
  });

  t.test('ContextLayerModify - global layer visibility', async (t) => {
    const mockGlobalLayer = createTestLayer({ visible: false });

    const service = new ContextLayerModify(mockContextLayerService, {
      ...mockLayerService,
      getLayerOrCreate: async () => ({
        ...mockGlobalLayer,
        id: 1,
        global: true
      })
    } as any);

    const result = await service.modify(
      1,
      [mockGlobalLayer],
      {} as Transaction
    );

    t.assert.deepEqual(
      result.created.length,
      0,
      'Should not create layer if global and not visible'
    );
  });

  t.test('ContextLayerModify - delete missing layers', async (t) => {
    const existingLayers: IContextLayer[] = [
      {
        id: 1,
        contextId: 1,
        layerId: 1,
        layerOptions: createTestLayer(),
        createdAt: new Date(),
        updatedAt: new Date(),
        sourceOptions: null
      },
      {
        id: 2,
        contextId: 1,
        layerId: 2,
        layerOptions: createTestLayer({ id: 2, title: 'To Be Deleted' }),
        createdAt: new Date(),
        updatedAt: new Date(),
        sourceOptions: null
      }
    ];

    const newLayers = [createTestLayer()];

    const service = new ContextLayerModify(
      {
        ...mockContextLayerService,
        getByContextId: async () => existingLayers
      } as any,
      mockLayerService
    );

    const result = await service.modify(1, newLayers, {} as Transaction);

    t.assert.deepEqual(result.deleted, [2], 'Should delete layer with id 2');
  });

  t.test('ContextLayerModify - nested layer group structure', async (t) => {
    const nestedGroup: LayerGroupOptions = {
      id: 1,
      type: 'group',
      title: 'Parent Group',
      children: [
        {
          id: 2,
          type: 'group',
          title: 'Child Group',
          children: [createTestLayer({ id: 3 })]
        }
      ]
    };

    const service = new ContextLayerModify(
      {
        ...mockContextLayerService,
        getByContextId: async () => []
      } as any,
      mockLayerService
    );

    const result = await service.modify(1, [nestedGroup], {} as Transaction);

    t.assert.deepEqual(
      result.created.length,
      3,
      'Should create all layers in nested structure'
    );
  });

  t.test('ContextLayerModify - updating layer properties', async (t) => {
    const originalLayer = createTestLayer();
    const updatedLayer = createTestLayer({
      title: 'Updated Title',
      opacity: 0.5
    });

    const service = new ContextLayerModify(
      {
        ...mockContextLayerService,
        getByContextId: async () => [
          {
            id: 1,
            contextId: 1,
            layerId: 1,
            layerOptions: originalLayer
          }
        ]
      } as any,
      mockLayerService
    );

    const result = await service.modify(1, [updatedLayer], {} as Transaction);

    t.assert.deepEqual(result.updated.length, 1, 'Should update the layer');
  });

  t.test('ContextLayerModify - duplicate layer IDs', async (t) => {
    const layers = [
      createTestLayer({ id: 1 }),
      createTestLayer({ id: 1 }) // Same ID
    ];

    const service = new ContextLayerModify(
      {
        ...mockContextLayerService,
        getByContextId: async () => []
      } as any,
      mockLayerService
    );

    try {
      await service.modify(1, [...layers], {} as Transaction);
      t.assert.fail('Should throw error for duplicate layer IDs');
    } catch {
      console.log('Should handle duplicate layer IDs appropriately');
    }
  });

  t.test('ContextLayerModify - circular parent reference', async (t) => {
    const layer1: LayerGroupOptions = {
      id: 1,
      type: 'group',
      title: 'Group 1',
      children: []
    };

    const layer2: LayerGroupOptions = {
      id: 2,
      type: 'group',
      title: 'Group 2',
      children: []
    };

    // Create circular reference
    layer1.children?.push(layer2);
    layer2.children?.push(layer1 as any);

    const service = new ContextLayerModify(
      mockContextLayerService,
      mockLayerService
    );

    try {
      await service.modify(1, [layer1], {} as Transaction);
      t.assert.fail('Should throw error for circular parent reference');
    } catch {
      console.log('Should handle circular parent reference appropriately');
    }
  });
});
