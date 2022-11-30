import test from 'tape';
import * as Jwt from 'jsonwebtoken';
import { Server, Config, Base64 } from '@igo2/base-api';
import { CredentialsConfig, JwtConfig } from '../configurations';
import { IgoJWTUser } from '../login/login.interface';
import { IProfilIgo } from '../profilIgo/profilIgo.interface';

Config.readConfig(`${__dirname}/../`, `configurations/config.${process.env.NODE_ENV || 'test'}.json`);

const serverConfigs = Config.getServerConfig();
const jwtConfig = Config.getConfig('jwt') as JwtConfig;
const credentialsConfig = Config.getConfig('credentials') as CredentialsConfig;
const adminCredentialsConfig = credentialsConfig.admins[0];
const standardCredentialsConfig = credentialsConfig.users[0];
const user2CredentialsConfig = credentialsConfig.users[1];

const runTests = async () => {
  const server = await Server.init(serverConfigs);

  const adminInfoPayload: IgoJWTUser = {
    user: {
      id: adminCredentialsConfig.username,
      source: 'igo',
      sourceId: adminCredentialsConfig.username,
      firstName: adminCredentialsConfig.firstName || 'ADMIN',
      lastName: adminCredentialsConfig.lastName || 'ADMIN',
      email: adminCredentialsConfig.email,
      isAdmin: true
    }
  };
  const standardInfoPayload: IgoJWTUser = {
    user: {
      id: standardCredentialsConfig.username,
      source: 'igo',
      sourceId: standardCredentialsConfig.username,
      firstName: standardCredentialsConfig.firstName,
      lastName: standardCredentialsConfig.lastName,
      email: standardCredentialsConfig.email,
      isAdmin: false
    }
  };
  const user2InfoPayload: IgoJWTUser = {
    user: {
      id: user2CredentialsConfig.username,
      source: 'igo',
      sourceId: user2CredentialsConfig.username,
      firstName: user2CredentialsConfig.firstName,
      lastName: user2CredentialsConfig.lastName,
      email: user2CredentialsConfig.email,
      isAdmin: false
    }
  };

  const adminToken = Jwt.sign(
    adminInfoPayload,
    jwtConfig.secretKey,
    Object.assign({}, jwtConfig.signOptions, { expiresIn: '14050d' })
  );
  const standardToken = Jwt.sign(
    standardInfoPayload,
    jwtConfig.secretKey,
    Object.assign({}, jwtConfig.signOptions, { expiresIn: '14050d' })
  );
  const user2Token = Jwt.sign(
    user2InfoPayload,
    jwtConfig.secretKey,
    Object.assign({}, jwtConfig.signOptions, { expiresIn: '14050d' })
  );

  const adminTokenHeaders = {
    authorization: `Bearer ${adminToken}`
  };
  const standardTokenHeaders = {
    authorization: `Bearer ${standardToken}`
  };

  const user2TokenHeaders = {
    authorization: `Bearer ${user2Token}`
  };

  // CREATE THE USERS
  const profilsToCreate = [];
  credentialsConfig.admins.concat(
    credentialsConfig.users).map(user => {
    profilsToCreate.concat(user.profils);
    server
      .inject({
        method: 'POST',
        url: '/login',
        headers: adminTokenHeaders,
        payload: {
          username: user.username,
          password: Base64.encode(user.password),
          source: user.source || 'igo'
        }
      });
  });

  // CREATE THE PROFILS
  const canShareToProfils = [];
  adminCredentialsConfig.profils.map((p, i) => {
    if (p !== 'admin') {
      canShareToProfils.push(i);
    }
  });
  if (adminCredentialsConfig.profils) {
    adminCredentialsConfig.profils.map((profil, id) => {
      const payload: IProfilIgo = {
        id,
        name: profil,
        title: profil
      };
      payload.canShare = true;
      if (profil === 'admin') {
        payload.canFilter = true;
        payload.canShareToProfils = canShareToProfils;
      }

      server
        .inject({
          method: 'POST',
          url: '/profils',
          headers: adminTokenHeaders,
          payload
        });
    });
  }

  test('POST /profils - another2', async (t) => {
    let response;
    const options = {
      method: 'POST',
      url: '/profils',
      headers: adminTokenHeaders,
      payload: {
        id: 18,
        name: 'another2',
        title: 'another2',
        canShare: true
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.name, 'another2');
      t.equal(result.title, 'another2');
      t.equal(result.canShare, true);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts - context 1', async (t) => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts',
      headers: standardTokenHeaders,
      payload: {
        uri: 'standardPrivate',
        title: 'standardPrivate',
        scope: 'private',
        map: {
          view: {
            center: [-73, 46]
          }
        }
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.uri, 'standardPrivate');
      t.equal(result.title, 'standardPrivate');
      t.equal(result.scope, 'private');
      t.equal(result.map.view.center[1], 46);
      t.equal(result.owner, standardCredentialsConfig.username);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts - context 2', async (t) => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts',
      headers: user2TokenHeaders,
      payload: {
        uri: 'user2Private',
        title: 'user2Private',
        scope: 'private',
        map: {}
      }
    };
    try {
      response = await server.inject(options);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts - context 3', async (t) => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts',
      headers: user2TokenHeaders,
      payload: {
        uri: 'user2public',
        title: 'user2public',
        scope: 'public',
        map: {}
      }
    };
    try {
      response = await server.inject(options);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts - context 4', async (t) => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts',
      headers: user2TokenHeaders,
      payload: {
        uri: 'user2publicWrite',
        title: 'user2publicWrite',
        scope: 'public',
        map: {}
      }
    };
    try {
      response = await server.inject(options);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts - context 5', async (t) => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts',
      headers: user2TokenHeaders,
      payload: {
        uri: 'user2Protected',
        title: 'user2Protected',
        scope: 'protected',
        map: {}
      }
    };
    try {
      response = await server.inject(options);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts - context 6', async (t) => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts',
      headers: user2TokenHeaders,
      payload: {
        uri: 'user2ProtectedWrite',
        title: 'user2ProtectedWrite',
        scope: 'protected',
        map: {}
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.uri, 'user2ProtectedWrite');
      t.equal(result.title, 'user2ProtectedWrite');
      t.equal(result.scope, 'protected');
      t.equal(result.owner, user2CredentialsConfig.username);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts - context 7', async (t) => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts',
      headers: adminTokenHeaders,
      payload: {
        uri: 'adminPublic',
        title: 'adminPublic',
        scope: 'public',
        map: {}
      }
    };
    try {
      response = await server.inject(options);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/4/permissions - before context', async (t) => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/4/permissions',
      headers: user2TokenHeaders,
      payload: {
        typePermission: 'write',
        profil: standardCredentialsConfig.username
      }
    };
    try {
      response = await server.inject(options);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/6/permissions - before context', async (t) => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/6/permissions',
      headers: user2TokenHeaders,
      payload: {
        typePermission: 'write',
        profil: standardCredentialsConfig.username
      }
    };
    try {
      response = await server.inject(options);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  // =========================================================

  test('POST /contexts/1/clone - context 1 ', async (t) => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/1/clone',
      headers: standardTokenHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.title, 'standardPrivate');
      t.equal(result.scope, 'private');
      t.equal(result.owner, standardCredentialsConfig.username);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/2/clone - context 2 ', async (t) => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/2/clone',
      headers: standardTokenHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.message, 'Must have read permission for this context');
      t.equal(response.statusCode, 403);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/3/clone - context 3 ', async (t) => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/3/clone',
      headers: standardTokenHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.title, 'user2public');
      t.equal(result.scope, 'private');
      t.equal(result.owner, standardCredentialsConfig.username);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/4/clone - context 4 ', async (t) => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/4/clone',
      headers: standardTokenHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.title, 'user2publicWrite');
      t.equal(result.scope, 'private');
      t.equal(result.owner, standardCredentialsConfig.username);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/5/clone - context 5 ', async (t) => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/5/clone',
      headers: standardTokenHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.message, 'Must have read permission for this context');
      t.equal(response.statusCode, 403);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/6/clone - context 6 ', async (t) => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/6/clone',
      headers: standardTokenHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.title, 'user2ProtectedWrite');
      t.equal(result.scope, 'private');
      t.equal(result.owner, standardCredentialsConfig.username);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  // =========================================================

  test('Patch /contexts/8 - context 8 ', async (t) => {
    let response;
    const options = {
      method: 'Patch',
      url: '/contexts/8',
      headers: standardTokenHeaders,
      payload: {
        title: 'standardPrivateClone',
        scope: 'public',
        map: {
          view: {
            zoom: 11
          }
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

  test('Patch /contexts/1 - context 1 ', async (t) => {
    let response;
    const options = {
      method: 'Patch',
      url: '/contexts/1',
      headers: standardTokenHeaders,
      payload: {
        map: {
          view: {
            zoom: 13
          }
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

  test('Patch /contexts/2 - context 2 ', async (t) => {
    let response;
    const options = {
      method: 'Patch',
      url: '/contexts/2',
      headers: standardTokenHeaders,
      payload: {
        map: {
          view: {
            zoom: 12
          }
        }
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

  test('Patch /contexts/3 - context 3 ', async (t) => {
    let response;
    const options = {
      method: 'Patch',
      url: '/contexts/3',
      headers: standardTokenHeaders,
      payload: {
        map: {
          view: {
            zoom: 3
          }
        }
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

  test('Patch /contexts/4 - context 4 ', async (t) => {
    let response;
    const options = {
      method: 'Patch',
      url: '/contexts/4',
      headers: standardTokenHeaders,
      payload: {
        map: {
          view: {
            zoom: 4
          }
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

  test('Patch /contexts/5 - context 5 ', async (t) => {
    let response;
    const options = {
      method: 'Patch',
      url: '/contexts/5',
      headers: standardTokenHeaders,
      payload: {
        map: {
          view: {
            zoom: 5
          }
        }
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

  test('Patch /contexts/6 - context 6 ', async (t) => {
    let response;
    const options = {
      method: 'Patch',
      url: '/contexts/6',
      headers: standardTokenHeaders,
      payload: {
        map: {
          view: {
            zoom: 6
          }
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

  // =========================================================

  test('GET /contexts/8 - context 8 ', async (t) => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/8',
      headers: standardTokenHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.title, 'standardPrivateClone');
      t.equal(result.scope, 'public');
      t.equal(result.map.view.zoom, 11);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('DELETE /contexts/8 - context 8 ', async (t) => {
    let response;
    const options = {
      method: 'DELETE',
      url: '/contexts/8',
      headers: standardTokenHeaders
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

  test('GET /contexts/8 - after delete ', async (t) => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/8',
      headers: standardTokenHeaders
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

  // =========================================================

  test('GET /contexts/1/details - context 1 ', async (t) => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/1/details',
      headers: standardTokenHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.title, 'standardPrivate');
      t.equal(result.scope, 'private');
      t.equal(result.map.view.zoom, 13);
      t.equal(result.permission, 'write');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /contexts/2/details - context 2 ', async (t) => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/2/details',
      headers: standardTokenHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.message, 'Must have read permission for this context');
      t.equal(response.statusCode, 403);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /contexts/3/details - context 3 ', async (t) => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/3/details',
      headers: standardTokenHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.title, 'user2public');
      t.equal(result.scope, 'public');
      t.equal(result.permission, 'read');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /contexts/4/details - context 4 ', async (t) => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/4/details',
      headers: standardTokenHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.title, 'user2publicWrite');
      t.equal(result.scope, 'public');
      t.equal(result.map.view.zoom, 4);
      t.equal(result.permission, 'write');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /contexts/5/details - context 5 ', async (t) => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/5/details',
      headers: standardTokenHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.message, 'Must have read permission for this context');
      t.equal(response.statusCode, 403);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /contexts/6/details - context 6 ', async (t) => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/6/details',
      headers: standardTokenHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.title, 'user2ProtectedWrite');
      t.equal(result.scope, 'protected');
      t.equal(result.map.view.zoom, 6);
      t.equal(result.permission, 'write');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /contexts/4/details - anonyme 4 ', async (t) => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/4/details'
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.title, 'user2publicWrite');
      t.equal(result.scope, 'public');
      t.equal(result.permission, 'read');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /contexts/6/details - anonyme 6 ', async (t) => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/6/details'
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.message, 'Must have read permission for this context');
      t.equal(response.statusCode, 403);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /contexts/4/details - admin 4 ', async (t) => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/4/details',
      headers: adminTokenHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.title, 'user2publicWrite');
      t.equal(result.scope, 'public');
      t.equal(result.permission, 'read');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /contexts/6/details - admin 6 ', async (t) => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/6/details',
      headers: adminTokenHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.message, 'Must have read permission for this context');
      t.equal(response.statusCode, 403);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  // =========================================================

  test('GET /contexts - admin ', async (t) => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts',
      headers: adminTokenHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.ours.length, 1);
      t.equal(result.shared.length, 0);
      t.equal(result.public.length, 0);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /contexts - anonyme ', async (t) => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts'
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.ours.length, 0);
      t.equal(result.shared.length, 0);
      t.equal(result.public.length, 1);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /contexts - standard ', async (t) => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts',
      headers: standardTokenHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.ours.length, 4);
      t.equal(result.shared.length, 1);
      t.equal(result.public.length, 2);
      t.equal(result.ours[0].permission, 'write');
      t.equal(result.shared[0].permission, 'write');
      t.equal(result.public[0].permission, 'read');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /contexts - user2 ', async (t) => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts',
      headers: user2TokenHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.ours.length, 5);
      t.equal(result.shared.length, 0);
      t.equal(result.public.length, 1);
      t.equal(result.ours[0].permission, 'write');
      t.equal(result.ours[2].permission, 'write');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts - anonyme', async (t) => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts',
      payload: {
        uri: 'anonyme2ProtectedWrite',
        title: 'anonyme2ProtectedWrite',
        scope: 'protected',
        map: {}
      }
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
};

runTests();
