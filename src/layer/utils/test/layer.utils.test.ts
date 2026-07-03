import test, { TestContext } from 'node:test';

import { sanitizeLayerSourceOptions } from '../layer.utils';

test('sanitizeLayerSourceOptions', (t: TestContext) => {
  // ----------------------------------------------------------------

  t.test('Removes unique-key columns from sourceOptions', (t: TestContext) => {
    t.test('Should strip type and url', (t: TestContext) => {
      const result = sanitizeLayerSourceOptions({
        type: 'wms',
        url: 'https://example.com/wms',
        version: '1.3.0'
      });

      t.assert.equal('type' in result, false);
      t.assert.equal('url' in result, false);
      t.assert.equal(result.version, '1.3.0');
    });

    t.test('Should strip params.layers', (t: TestContext) => {
      const result = sanitizeLayerSourceOptions({
        type: 'wms',
        url: 'https://example.com/wms',
        params: { layers: 'MY_LAYER', VERSION: '1.3.0' }
      });

      const params = result.params as Record<string, unknown> | undefined;
      t.assert.equal(params?.['layers'], undefined);
      t.assert.equal(params?.['VERSION'], '1.3.0');
    });

    t.test('Should strip params.LAYERS', (t: TestContext) => {
      const result = sanitizeLayerSourceOptions({
        type: 'wms',
        url: 'https://example.com/wms',
        params: { LAYERS: 'MY_LAYER', STYLES: 'default' }
      });

      const params = result.params as Record<string, unknown> | undefined;
      t.assert.equal(params?.['LAYERS'], undefined);
      t.assert.equal(params?.['STYLES'], 'default');
    });

    t.test(
      'Should omit params entirely when it becomes empty',
      (t: TestContext) => {
        const result = sanitizeLayerSourceOptions({
          type: 'wms',
          url: 'https://example.com/wms',
          params: { layers: 'MY_LAYER', LAYERS: 'MY_LAYER' }
        });

        t.assert.equal('params' in result, false);
      }
    );

    t.test(
      'Should preserve other params keys when remaining ones exist',
      (t: TestContext) => {
        const result = sanitizeLayerSourceOptions({
          type: 'wms',
          url: 'https://example.com/wms',
          params: { layers: 'MY_LAYER', VERSION: '1.1.1', DPI: 96 }
        });

        const actual: unknown = result.params;
        t.assert.deepStrictEqual(actual, { VERSION: '1.1.1', DPI: 96 });
      }
    );
  });

  // ----------------------------------------------------------------

  t.test('Preserves non-key sourceOptions fields', (t: TestContext) => {
    t.test('Should keep optionsFromCapabilities', (t: TestContext) => {
      const result = sanitizeLayerSourceOptions({
        type: 'wms',
        url: 'https://example.com/wms',
        optionsFromCapabilities: true
      });

      t.assert.equal(result.optionsFromCapabilities, true);
    });

    t.test('Should keep ogcFilters', (t: TestContext) => {
      const filters = { enabled: true };
      const result = sanitizeLayerSourceOptions({
        type: 'wms',
        url: 'https://example.com/wms',
        ogcFilters: filters as never
      });

      const actual: unknown = result.ogcFilters;
      t.assert.deepStrictEqual(actual, filters);
    });

    t.test(
      'Should return empty object when only unique-key fields are present',
      (t: TestContext) => {
        const result = sanitizeLayerSourceOptions({
          type: 'wms',
          url: 'https://example.com/wms'
        });

        const actual: unknown = result;
        t.assert.deepStrictEqual(actual, {});
      }
    );
  });

  // ----------------------------------------------------------------

  t.test('Edge cases', (t: TestContext) => {
    t.test('Should handle missing params gracefully', (t: TestContext) => {
      const result = sanitizeLayerSourceOptions({
        type: 'xyz',
        url: 'https://example.com/xyz'
      });

      t.assert.equal('params' in result, false);
    });

    t.test('Should handle empty params object', (t: TestContext) => {
      const result = sanitizeLayerSourceOptions({
        type: 'wms',
        url: 'https://example.com/wms',
        params: {}
      });

      t.assert.equal('params' in result, false);
    });
  });
});
