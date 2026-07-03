import { IncomingHttpHeaders } from 'node:http';

import { AppInstance } from '../../app.interface';
import { ALL_USERS_HEADERS } from '../../auth/test/auth.mock';
import { IUser } from '../user.interface';

export async function syncUsers(app: AppInstance) {
  return Promise.all(ALL_USERS_HEADERS.map((user) => syncUser(app, user)));
}

async function syncUser(app: AppInstance, headers: IncomingHttpHeaders) {
  try {
    const response = await app.inject({
      method: 'GET',
      headers,
      url: '/users/sync'
    });
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getUserRaw(
  app: AppInstance,
  headers: IncomingHttpHeaders
) {
  const response = await app.inject({
    method: 'GET',
    headers,
    url: `/users`
  });

  return response;
}

export async function getUser(
  app: AppInstance,
  headers: IncomingHttpHeaders
): Promise<IUser> {
  try {
    const response = await getUserRaw(app, headers);

    const result = response.json<IUser>();
    if (response.statusCode >= 300) {
      console.error(result);

      throw new Error(response.body);
    }
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
