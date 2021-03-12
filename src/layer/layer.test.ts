import test from 'tape';
import * as Configs from '../configurations';
import { Server, Config } from '@igo2/base-api';

Config.readConfig(`${__dirname}/../`, `configurations/config.${process.env.NODE_ENV || 'dev'}.json`);

const serverConfigs = Config.getServerConfig();
const testConfigs = Configs.getTestConfig();
const anonymeHeaders: any = testConfigs.anonymeHeaders;
const adminHeaders: any = testConfigs.adminHeaders;
const standardHeaders: any = testConfigs.standardHeaders;

const runTests = async () => {
  const server = await Server.init(serverConfigs);

  test('POST /layers - admin', async (t) => {
    let response;
    const options = {
      method: 'POST',
      url: '/layers',
      headers: adminHeaders,
      payload: {
        type: 'osm',
        layerOptions: {
          title: 'dummyTitle'
        },
        sourceOptions: {}
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.type, 'osm');
      t.equal(result.layerOptions.title, 'dummyTitle');
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /layers - admin 2', async (t) => {
    let response;
    const options = {
      method: 'POST',
      url: '/layers',
      headers: adminHeaders,
      payload: {
        type: 'wms',
        layerOptions: {
          title: 'dummyTitle2'
        },
        sourceOptions: {}
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.layerOptions.title, 'dummyTitle2');
      t.equal(result.type, 'wms');
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /layers - admin - type missing', async (t) => {
    let response;
    const options = {
      method: 'POST',
      url: '/layers',
      headers: adminHeaders,
      payload: {
        layerOptions: {
          title: 'dummyTitle'
        },
        sourceOptions: {}
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      const message = '"type" is required';
      t.equal(result.message, message);
      t.equal(response.statusCode, 400);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /layers - anonyme', async (t) => {
    let response;
    const options = {
      method: 'POST',
      url: '/layers',
      headers: anonymeHeaders,
      payload: {
        type: 'wfs',
        layerOptions: {
          title: 'dummyAnonyme'
        },
        sourceOptions: {}
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.layerOptions.title, 'dummyAnonyme');
      t.equal(result.type, 'wfs');
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /layers - standard', async (t) => {
    let response;
    const options = {
      method: 'POST',
      url: '/layers',
      headers: standardHeaders,
      payload: {
        type: 'wms',
        layers: 'tests',
        layerOptions: {
          title: 'dummyStandard'
        },
        sourceOptions: {}
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.layerOptions.title, 'dummyStandard');
      t.equal(result.type, 'wms');
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  // ----------------------------------------------------------------

  test('GET /layers - admin', async (t) => {
    let response;
    const options = {
      method: 'GET',
      url: '/layers',
      headers: adminHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.length, 4);
      t.equal(result[0].layerOptions.title, 'dummyTitle');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /layers - anonyme', async (t) => {
    let response;
    const options = {
      method: 'GET',
      url: '/layers',
      headers: anonymeHeaders
    };
    try {
      response = await server.inject(options);
      t.equal(response.statusCode, 401);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /layers - standard', async (t) => {
    let response;
    const options = {
      method: 'GET',
      url: '/layers',
      headers: standardHeaders
    };
    try {
      response = await server.inject(options);
      t.equal(response.statusCode, 403);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  // ----------------------------------------------------------------

  test('PATCH /layers/{id} - admin', async (t) => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/layers/2',
      headers: adminHeaders,
      payload: {
        sourceOptions: {
          version: '1.3.0'
        }
      }
    };
    try {
      response = await server.inject(options);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('PATCH /layers/{id} - anonyme', async (t) => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/layers/2',
      headers: anonymeHeaders,
      payload: {
        layerOptions: {
          title: 'dummy99'
        }
      }
    };
    try {
      response = await server.inject(options);
      t.equal(response.statusCode, 401);
      const result: any = response.result;
      t.equal(result.message, 'Must be authenticated');
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('PATCH /layers/{id} - standard', async (t) => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/layers/2',
      headers: standardHeaders,
      payload: {
        layerOptions: {
          title: 'dummy99'
        }
      }
    };
    try {
      response = await server.inject(options);
      t.equal(response.statusCode, 403);
      const result: any = response.result;
      t.equal(result.message, 'Must be administrator');
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  // ----------------------------------------------------------------

  test('GET /layers/{id} - admin', async (t) => {
    let response;
    const options = {
      method: 'GET',
      url: '/layers/10',
      headers: adminHeaders
    };
    try {
      response = await server.inject(options);
      t.equal(response.statusCode, 404);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /layers/{id} - admin', async (t) => {
    let response;
    const options = {
      method: 'GET',
      url: '/layers/1',
      headers: adminHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.layerOptions.title, 'dummyTitle');
      t.equal(result.type, 'osm');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /layers/{id} - anonyme', async (t) => {
    let response;
    const options = {
      method: 'GET',
      url: '/layers/2',
      headers: anonymeHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.layerOptions.title, 'dummyTitle2');
      t.equal(result.type, 'wms');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /layers/{id} - standard', async (t) => {
    let response;
    const options = {
      method: 'GET',
      url: '/layers/1',
      headers: standardHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.layerOptions.title, 'dummyTitle');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  // ----------------------------------------------------------------

  test('DELETE /layers/{id} - anonyme', async (t) => {
    let response;
    const options = {
      method: 'DELETE',
      url: '/layers/3',
      headers: anonymeHeaders
    };
    try {
      response = await server.inject(options);
      t.equal(response.statusCode, 401);
      const result: any = response.result;
      t.equal(result.message, 'Must be authenticated');
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('DELETE /layers/{id} - standard', async (t) => {
    let response;
    const options = {
      method: 'DELETE',
      url: '/layers/3',
      headers: standardHeaders
    };
    try {
      response = await server.inject(options);
      t.equal(response.statusCode, 403);
      const result: any = response.result;
      t.equal(result.message, 'Must be administrator');
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('DELETE /layers/{id} - admin', async (t) => {
    let response;
    const options = {
      method: 'DELETE',
      url: '/layers/3',
      headers: adminHeaders
    };
    try {
      response = await server.inject(options);
      t.equal(response.statusCode, 204);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /layers - admin', async (t) => {
    let response;
    const options = {
      method: 'GET',
      url: '/layers',
      headers: adminHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.length, 3);
      t.equal(result[0].layerOptions.title, 'dummyTitle');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });
};

runTests();
