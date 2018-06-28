import * as test from 'tape';
import * as Server from '../server';
import * as Configs from '../configurations';
import { database } from '../database';

const serverConfigs = Configs.getServerConfig();
const testConfigs = Configs.getTestConfig();
const anonyme = testConfigs.anonyme;
const userStandard = testConfigs.standard;


const runTests = async () => {
  const server = await Server.init(serverConfigs);

  const user = await database.user.findOne({
    where: {
      sourceId: 1
    }
  });

  if (!user) {
    await database.user.create({
      sourceId: '1',
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
        zoom:  6,
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
      headers: {
        'x-consumer-username': 'test',
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-custom-id': '1'
      },
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
      headers: {
        'x-consumer-username': anonyme.xConsumerUsername,
        'x-consumer-id': anonyme.xConsumerId,
        'x-anonymous-consumer': 'true'
      },
      payload: {
        title: 'poi1',
        zoom:  6,
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

  test('POST /pois - userStandard', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/pois',
      headers: {
        'x-consumer-username': 'test',
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-custom-id': '1'
      },
      payload: {
        title: 'poi1',
        zoom:  6,
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

  test('POST /pois - userStandard bis', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/pois',
      headers: {
        'x-consumer-username': 'test',
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-custom-id': '1'
      },
      payload: {
        title: 'poi2',
        zoom:  2,
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
      headers: {
        'x-consumer-username': anonyme.xConsumerUsername,
        'x-consumer-id': anonyme.xConsumerId,
        'x-anonymous-consumer': 'true'
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

  test('GET /pois - userStandard', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/pois',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-custom-id': '1'
      }
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
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-custom-id': '10'
      }
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
      headers: {
        'x-consumer-username': anonyme.xConsumerUsername,
        'x-consumer-id': anonyme.xConsumerId,
        'x-anonymous-consumer': 'true'
      },
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

  test('PATCH /pois/{id} - userStandard', async t => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/pois/2',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-custom-id': '1'
      },
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
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-custom-id': '9'
      },
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
      headers: {
        'x-consumer-username': anonyme.xConsumerUsername,
        'x-consumer-id': anonyme.xConsumerId,
        'x-anonymous-consumer': 'true'
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

  test('GET /pois/{id} - userStandard', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/pois/2',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-custom-id': '1'
      }
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
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-custom-id': '9'
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

  test('DELETE /pois/{id} - anonyme', async t => {
    let response;
    const options = {
      method: 'DELETE',
      url: '/pois/2',
      headers: {
        'x-consumer-username': anonyme.xConsumerUsername,
        'x-consumer-id': anonyme.xConsumerId,
        'x-anonymous-consumer': 'true'
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

  test('DELETE /pois/{id} - another user', async t => {
    let response;
    const options = {
      method: 'DELETE',
      url: '/pois/2',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-custom-id': '9'
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

  test('DELETE /pois/{id} - userStandard', async t => {
    let response;
    const options = {
      method: 'DELETE',
      url: '/pois/2',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-custom-id': '1'
      }
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
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-custom-id': '1'
      }
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
