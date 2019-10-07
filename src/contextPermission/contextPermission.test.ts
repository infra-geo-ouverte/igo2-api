import * as test from 'tape';
import * as Server from '../server';
import * as Configs from '../configurations';

const serverConfigs = Configs.getServerConfig();
const testConfigs = Configs.getTestConfig();
const standardHeaders: any = testConfigs.standardHeaders;
const user2Headers: any = testConfigs.user2Headers;

const runTests = async () => {
  const server = await Server.init(serverConfigs);

  test('POST /contexts/{id}/permissions - before permContext', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/4/permissions',
      headers: user2Headers,
      payload: {
        typePermission: 'write',
        profil: standardHeaders['x-consumer-username']
      }
    };
    try {
      response = await server.inject(options);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/{id}/permissions - before permContext', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/6/permissions',
      headers: user2Headers,
      payload: {
        typePermission: 'write',
        profil: standardHeaders['x-consumer-username']
      }
    };
    try {
      response = await server.inject(options);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  // ===========================================================

  test('POST /contexts/1/permissions - standard', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/1/permissions',
      headers: standardHeaders,
      payload: {
        typePermission: 'read',
        profil: 'test'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result[0];
      t.equal(result.profil, 'test');
      t.equal(result.typePermission, 'read');
      t.equal(Number(result.contextId), 1);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/2/permissions - standard', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/2/permissions',
      headers: standardHeaders,
      payload: {
        typePermission: 'read',
        profil: 'test'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/3/permissions - standard', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/3/permissions',
      headers: standardHeaders,
      payload: {
        typePermission: 'read',
        profil: 'test'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/4/permissions - standard', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/4/permissions',
      headers: standardHeaders,
      payload: {
        typePermission: 'read',
        profil: 'test, test2'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result[0].profil, 'test');
      t.equal(result[0].typePermission, 'read');
      t.equal(Number(result[0].contextId), 4);
      t.equal(result[1].profil, 'test2');
      t.equal(result[1].typePermission, 'read');
      t.equal(Number(result[1].contextId), 4);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/5/permissions - standard', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/5/permissions',
      headers: standardHeaders,
      payload: {
        typePermission: 'read',
        profil: 'test'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/6/permissions - standard', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/6/permissions',
      headers: standardHeaders,
      payload: {
        typePermission: 'write',
        profil: 'test'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result[0];
      t.equal(result.profil, 'test');
      t.equal(result.typePermission, 'write');
      t.equal(Number(result.contextId), 6);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/10/permissions - standard', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/1/permissions',
      headers: standardHeaders,
      payload: {
        typePermission: 'read',
        profil: 'test'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.message, 'The pair contextId and profil must be unique.');
      t.equal(response.statusCode, 409);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/6/permissions - user2', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/6/permissions',
      headers: user2Headers,
      payload: {
        typePermission: 'read',
        profil: 'test'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.message, 'The pair contextId and profil must be unique.');
      t.equal(response.statusCode, 409);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/6/permissions - user2', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/6/permissions',
      headers: user2Headers,
      payload: {
        typePermission: 'read',
        profil: 'test'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      const message = 'The pair contextId and profil must be unique.';
      t.equal(result.message, message);
      t.equal(response.statusCode, 409);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/4/permissions - user2', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/4/permissions',
      headers: user2Headers,
      payload: {
        typePermission: 'read',
        profil: 'test22'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result[0];
      t.equal(result.profil, 'test22');
      t.equal(result.typePermission, 'read');
      t.equal(Number(result.contextId), 4);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/4/permissions - user2', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/4/permissions',
      headers: user2Headers,
      payload: {
        typePermission: 'test',
        profil: 'test2'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.message, 'Invalid request payload input');
      t.equal(response.statusCode, 400);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  // ===============================================

  test('PATCH /contexts/1/permissions/1 - id not allowed', async t => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/contexts/1/permissions/1',
      headers: standardHeaders,
      payload: {
        id: '1234'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.message, 'Invalid request payload input');
      t.equal(response.statusCode, 400);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('PATCH /contexts/1/permissions/1 - standard', async t => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/contexts/1/permissions/1',
      headers: standardHeaders,
      payload: {
        profil: 'anotherProfil',
        typePermission: 'write'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(Number(result.id), 1);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('PATCH /contexts/2/permissions/1 - standard', async t => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/contexts/2/permissions/1',
      headers: standardHeaders,
      payload: {
        typePermission: 'write'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('PATCH /contexts/3/permissions/1 - standard', async t => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/contexts/3/permissions/1',
      headers: standardHeaders,
      payload: {
        typePermission: 'write'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('PATCH /contexts/4/permissions/2 - standard', async t => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/contexts/4/permissions/2',
      headers: standardHeaders,
      payload: {
        typePermission: 'write'
      }
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

  test('PATCH /contexts/5/permissions/1 - standard', async t => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/contexts/5/permissions/1',
      headers: standardHeaders,
      payload: {
        typePermission: 'write'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('PATCH /contexts/6/permissions/1 - standard', async t => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/contexts/6/permissions/1',
      headers: standardHeaders,
      payload: {
        typePermission: 'write'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(Number(result.id), 1);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('PATCH /contexts/1/permissions/10 - standard', async t => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/contexts/1/permissions/10',
      headers: standardHeaders,
      payload: {
        typePermission: 'write'
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

  // ===================================

  test('GET /contexts/1/permissions - standard', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/1/permissions',
      headers: standardHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.length, 1);
      t.equal(result[0].profil, 'test');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /contexts/2/permissions - standard', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/2/permissions',
      headers: standardHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /contexts/3/permissions - standard', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/3/permissions',
      headers: standardHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /contexts/4/permissions - standard', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/4/permissions',
      headers: standardHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /contexts/5/permissions - standard', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/5/permissions',
      headers: standardHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /contexts/6/permissions - standard', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/6/permissions',
      headers: standardHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.length, 2);
      t.equal(result[0].profil, standardHeaders['x-consumer-username']);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  // ============================================

  test('DELETE /contexts/1/permissions/3 - standard', async t => {
    let response;
    const options = {
      method: 'DELETE',
      url: '/contexts/1/permissions/3',
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

  test('GET /contexts/1/permissions - standard', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/1/permissions',
      headers: standardHeaders
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
};
runTests();
