import { IncomingHttpHeaders } from 'node:http';

import { AppInstance } from '../../app.interface';
import { IProfil } from '../profil.interface';

export const PROFIL_ADMIN_MOCK: IProfil = {
  name: 'admin',
  title: 'Admin',
  canShare: true,
  id: 1,
  group: 'admin',
  preference: {},
  canShareToProfils: [0],
  canFilter: true,
  hasAcrigeo: true,
  guides: ['admin'],
  hasOsrmPrivateAccess: true
};

export const ALL_PROFIL_MOCK: IProfil[] = [PROFIL_ADMIN_MOCK];

let id = 0;
export async function createProfil(
  app: AppInstance,
  headers: IncomingHttpHeaders,
  payload: IProfil
) {
  try {
    const response = await app.inject({
      method: 'POST',
      headers,
      url: `/profils`,
      payload: {
        ...payload,
        id
      }
    });

    id++;
    if (response.statusCode >= 300) {
      console.error(response.json());

      throw new Error(response.body);
    }
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
