import { IncomingHttpHeaders } from 'node:http';

import { uuid } from '@igo2/base-api';

import { AppInstance } from '../../app.interface';
import {
  HEADERS_ADMIN,
  HEADERS_USER_1,
  HEADERS_USER_2,
  findHeaderByCustomId
} from '../../auth/test/auth.mock';
import { createProfil } from '../../profil/test/profil.mock';
import { ITool } from '../../tool';
import { createMockTool } from '../../tool/test/tool.mock';
import {
  IContext,
  IContextDetailed,
  IContextDetailedIn,
  IContextIn,
  Scope
} from '../context.interface';

export const CONTEXT_1_MOCK: IContextIn = {
  uri: 'standardPrivate',
  title: 'standardPrivate',
  scope: 'private',
  userId: Number(HEADERS_USER_1['x-consumer-custom-id']),
  icon: null,
  map: {
    view: {
      center: [-73, 46],
      zoom: 8,
      projection: 'EPSG:4326'
    }
  }
};

export const CONTEXT_2_MOCK: IContextIn = {
  uri: 'user2Private',
  title: 'user2Private',
  scope: 'private',
  userId: Number(HEADERS_USER_2['x-consumer-custom-id']),
  icon: null,
  map: {
    view: {
      center: [-73, 46],
      zoom: 8,
      projection: 'EPSG:4326'
    }
  }
};

export const CONTEXT_3_MOCK: IContextIn = {
  uri: 'user2public',
  title: 'user2public',
  scope: 'public',
  icon: null,
  userId: Number(HEADERS_USER_2['x-consumer-custom-id'])
};

export const CONTEXT_4_MOCK: IContextIn = {
  uri: 'user2publicWrite',
  title: 'user2publicWrite',
  scope: 'public',
  icon: null,
  userId: Number(HEADERS_USER_2['x-consumer-custom-id'])
};

export const CONTEXT_5_MOCK: IContextIn = {
  uri: 'user2Protected',
  title: 'user2Protected',
  scope: 'protected',
  icon: null,
  userId: Number(HEADERS_USER_2['x-consumer-custom-id'])
};

export const CONTEXT_6_MOCK: IContextIn = {
  uri: 'user2ProtectedWrite',
  title: 'user2ProtectedWrite',
  icon: null,
  scope: 'protected',
  userId: Number(HEADERS_USER_2['x-consumer-custom-id'])
};

export const CONTEXT_7_MOCK: IContextIn = {
  uri: 'adminPublic',
  title: 'adminPublic',
  scope: 'public',
  icon: null,
  userId: Number(HEADERS_USER_2['x-consumer-custom-id'])
};

export const ALL_CONTEXTS: (IContextIn | IContextDetailedIn)[] = [
  CONTEXT_1_MOCK,
  CONTEXT_2_MOCK,
  CONTEXT_3_MOCK,
  CONTEXT_4_MOCK,
  CONTEXT_5_MOCK,
  CONTEXT_6_MOCK,
  CONTEXT_7_MOCK
];

export function getMockContext(scope: Scope): IContextDetailedIn {
  return {
    ...(CONTEXT_1_MOCK as IContext),
    uri: uuid(),
    scope
  };
}

export interface IContextMockedData {
  user1: IContextInfoByUser;
  user2: IContextInfoByUser;
  tools: ITool[];
}

interface IContextInfoByUser {
  contexts: IContextDetailed[];
}

export async function createContext(
  app: AppInstance,
  context: IContextDetailedIn,
  headers: IncomingHttpHeaders
) {
  try {
    const response = await app.inject({
      method: 'POST',
      headers,
      url: '/contexts',
      payload: context
    });
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function appendMockedContexts(
  app: AppInstance,
  contexts = ALL_CONTEXTS
): Promise<IContextMockedData> {
  await createProfil(app, HEADERS_ADMIN, {
    id: 1,
    name: 'all',
    title: 'Tout le monde',
    canShare: true,
    canFilter: true,
    hasAcrigeo: true,
    preference: {},
    group: null,
    canShareToProfils: null,
    guides: null,
    hasOsrmPrivateAccess: null
  });
  const contextsDb: IContextDetailed[] = [];

  for (const { userId, ...context } of contexts) {
    const header = userId ? findHeaderByCustomId(userId) : undefined;

    if (!header) {
      throw new Error(`No header found for owner: ${userId}`);
    }

    // 'await' inside the loop pauses execution until the promise resolves
    const result = await createContext(app, context, header);
    if (result.statusCode >= 300) {
      throw new Error(result.body);
    }
    contextsDb.push(result.json());
  }

  const tool1 = await createMockTool(app, HEADERS_ADMIN, {
    name: 'test',
    title: 'Test',
    id: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    options: {},
    order: null,
    profils: null,
    global: null,
    icon: null,
    tooltip: null,
    inToolbar: null
  });

  const tool2 = await createMockTool(app, HEADERS_ADMIN, {
    name: 'test2',
    title: 'Test2',
    id: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    options: {},
    order: null,
    profils: null,
    global: null,
    icon: null,
    tooltip: null,
    inToolbar: null
  });

  return {
    user1: {
      contexts: [contextsDb[0]]
    },
    user2: {
      contexts: [
        contextsDb[1],
        contextsDb[2],
        contextsDb[3],
        contextsDb[4],
        contextsDb[5],
        contextsDb[6]
      ]
    },
    tools: [tool1.json(), tool2.json()]
  };
}

export async function getContextDetails(
  app: AppInstance,
  id: number,
  headers: IncomingHttpHeaders
) {
  const response = await app.inject({
    method: 'GET',
    headers,
    url: `/contexts/${id}/details`
  });

  return response;
}
