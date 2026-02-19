import { IncomingHttpHeaders } from 'node:http';
import test from 'node:test';

import { resetDatabase } from '../../../scripts/src/seeder';
import { buildApp } from '../../app';
import { AppInstance } from '../../app.interface';
import { HEADERS_ADMIN } from '../../auth/test/auth.mock';
import { IProfil } from '../profil.interface';

test('Profil IGO', async (t) => {
  let app: AppInstance;

  t.before(async () => {
    app = await buildApp();
    await resetDatabase(app);
  });

  t.after(async () => {
    await app.close();
  });

  t.test('POST /profils - another', async (t) => {
    const profil: IProfil = {
      id: 123456789,
      name: 'anotherTest',
      title: 'another',
      canShare: true,
      group: 'admin',
      preference: {},
      canShareToProfils: [0],
      canFilter: true,
      hasAcrigeo: true,
      guides: ['admin'],
      hasOsrmPrivateAccess: true
    };
    const response = await createProfil(app, HEADERS_ADMIN, profil);
    const profilBD = response.json();

    t.assert.equal(profilBD.name, profil.name);
    t.assert.equal(profilBD.title, profil.title);
    t.assert.equal(profilBD.canShare, profil.canShare);

    await deleteProfil(app, HEADERS_ADMIN, profil.name);
  });
});

async function createProfil(
  app: AppInstance,
  headers: IncomingHttpHeaders,
  profil: IProfil
) {
  return app.inject({
    method: 'POST',
    headers,
    url: '/profils',
    payload: profil
  });
}

async function deleteProfil(
  app: AppInstance,
  headers: IncomingHttpHeaders,
  name: string
) {
  return app.inject({
    method: 'DELETE',
    headers,
    url: `/profils/${name}`
  });
}
