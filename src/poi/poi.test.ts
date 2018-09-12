import * as test from 'tape';
import * as Server from '../server';
import * as Configs from '../configurations';
import { database } from '../database';

const serverConfigs = Configs.getServerConfig();
const testConfigs = Configs.getTestConfig();
const anonymeHeaders: any = testConfigs.anonymeHeaders;
const standardHeaders: any = testConfigs.standardHeaders;
const user2Headers: any = testConfigs.user2Headers;

const runTests = async () => {
  const server = await Server.init(serverConfigs);

  const user = await database.user.findOne({
    where: {
      sourceId: standardHeaders['x-consumer-custom-id']
    }
  });

  if (!user) {
    await database.user.create({
      sourceId: standardHeaders['x-consumer-custom-id'],
      source: 'test'
    });
  }

  test('POST /pois - headers missing', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/pois',
      payload: {
        title: 'poi1',
        zoom: 6,
        x: -73.22,
        y: 46.44
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.message, 'Must be authenticated');
      t.equal(response.statusCode, 401);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /pois - zoom missing', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/pois',
      headers: standardHeaders,
      payload: {
        title: 'poi1',
        x: -73.22,
        y: 46.44
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      const message = 'Invalid request payload input';
      t.equal(result.message, message);
      t.equal(response.statusCode, 400);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /pois - anonyme', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/pois',
      headers: anonymeHeaders,
      payload: {
        title: 'poi1',
        zoom: 6,
        x: -73.22,
        y: 46.44
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.message, 'Must be authenticated');
      t.equal(response.statusCode, 401);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /pois - standard', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/pois',
      headers: standardHeaders,
      payload: {
        title: 'poi1',
        zoom: 6,
        x: -73.22,
        y: 46.44
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.title, 'poi1');
      t.equal(result.zoom, 6);
      t.equal(result.x, -73.22);
      t.equal(result.y, 46.44);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /pois - standard bis', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/pois',
      headers: standardHeaders,
      payload: {
        title: 'poi2',
        zoom: 2,
        x: -53.22,
        y: 26.44
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.title, 'poi2');
      t.equal(result.zoom, 2);
      t.equal(result.x, -53.22);
      t.equal(result.y, 26.44);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  // ----------------------------------------------------------------

  test('GET /pois - anonyme', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/pois',
      headers: anonymeHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.message, 'Must be authenticated');
      t.equal(response.statusCode, 401);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /pois - standard', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/pois',
      headers: standardHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.length, 2);
      t.equal(result[0].title, 'poi1');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /pois - user2', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/pois',
      headers: user2Headers
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.length, 0);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  // ----------------------------------------------------------------

  test('PATCH /pois/{id} - anonyme', async t => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/pois/2',
      headers: anonymeHeaders,
      payload: {
        title: 'dummy99'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.message, 'Must be authenticated');
      t.equal(response.statusCode, 401);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('PATCH /pois/{id} - standard', async t => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/pois/2',
      headers: standardHeaders,
      payload: {
        title: 'dummy99'
      }
    };
    try {
      response = await server.inject(options);
      t.equal(response.statusCode, 200);
      const result: any = response.result;
      t.equal(result.id, '2');
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('PATCH /pois/{id} - another user', async t => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/pois/2',
      headers: user2Headers,
      payload: {
        title: 'dummy99'
      }
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

  // ----------------------------------------------------------------

  test('GET /pois/{id} - anonyme', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/pois/2',
      headers: anonymeHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.message, 'Must be authenticated');
      t.equal(response.statusCode, 401);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /pois/{id} - standard', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/pois/2',
      headers: standardHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.title, 'dummy99');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /pois/{id} - another user', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/pois/1',
      headers: user2Headers
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

  // ----------------------------------------------------------------

  test('DELETE /pois/{id} - anonyme', async t => {
    let response;
    const options = {
      method: 'DELETE',
      url: '/pois/2',
      headers: anonymeHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.message, 'Must be authenticated');
      t.equal(response.statusCode, 401);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('DELETE /pois/{id} - another user', async t => {
    let response;
    const options = {
      method: 'DELETE',
      url: '/pois/2',
      headers: user2Headers
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

  test('DELETE /pois/{id} - standard', async t => {
    let response;
    const options = {
      method: 'DELETE',
      url: '/pois/2',
      headers: standardHeaders
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

  test('GET /pois - after delete', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/pois',
      headers: standardHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.length, 1);
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
