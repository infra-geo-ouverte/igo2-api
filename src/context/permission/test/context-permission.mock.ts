import { IncomingHttpHeaders } from 'node:http';

import { AppInstance } from '../../../app.interface';
import {
  HEADERS_USER_1,
  HEADERS_USER_2,
  mockAuthFindMany
} from '../../../auth/test/auth.mock';
import { ITool } from '../../../tool';
import { getUser } from '../../../user/test/user.mock';
import { IContextDetailed } from '../../context.interface';
import { ALL_CONTEXTS, appendMockedContexts } from '../../test/context.mock';
import {
  IAnyContextPermission,
  IAnyContextPermissionIn
} from '../context-permission.interface';

export interface IContextMockedDataWithPermission {
  user1: Record<number, IContextInfoByUser>;
  user2: Record<number, IContextInfoByUser>;
  tools: ITool[];
}

interface IContextInfoByUser {
  context: IContextDetailed;
  permission?: IAnyContextPermission;
}

export async function appendContextsWithPermission(
  app: AppInstance,
  contexts = ALL_CONTEXTS
) {
  const data = await appendMockedContexts(app, contexts);
  const [context1] = data.user1.contexts;
  const [context2, context3, context4, context5, context6, context7] =
    data.user2.contexts;

  const user1 = await getUser(app, HEADERS_USER_1);

  const user1WritePermission: IAnyContextPermissionIn = {
    typePermission: 'write',
    userId: user1.id,
    userExternalId: user1.externalId,
    contextId: 0
  };
  const user1ReadPermission: IAnyContextPermissionIn = {
    typePermission: 'read',
    userId: user1.id,
    userExternalId: user1.externalId,
    contextId: 0
  };

  const permission1 = await createPermissionsSafely(
    app,
    context1.id,
    HEADERS_USER_1,
    user1ReadPermission
  );
  const permission2 = await createPermissionsSafely(
    app,
    context2.id,
    HEADERS_USER_2,
    user1ReadPermission
  );
  const permission3 = await createPermissionsSafely(
    app,
    context3.id,
    HEADERS_USER_2,
    user1ReadPermission
  );
  const permission4 = await createPermissionsSafely(
    app,
    context4.id,
    HEADERS_USER_2,
    user1WritePermission
  );
  const permission6 = await createPermissionsSafely(
    app,
    context6.id,
    HEADERS_USER_2,
    user1WritePermission
  );
  const permission7 = await createPermissionsSafely(
    app,
    context7.id,
    HEADERS_USER_2,
    user1ReadPermission
  );

  return {
    user1: {
      1: {
        context: context1,
        permission: permission1.json<IAnyContextPermission>()
      }
    },
    user2: {
      2: {
        context: context2,
        permission: permission2.json<IAnyContextPermission>()
      },
      3: {
        context: context3,
        permission: permission3.json<IAnyContextPermission>()
      },
      4: {
        context: context4,
        permission: permission4.json<IAnyContextPermission>()
      },
      5: {
        context: context5,
        permission: undefined
      },
      6: {
        context: context6,
        permission: permission6.json<IAnyContextPermission>()
      },
      7: {
        context: context7,
        permission: permission7.json<IAnyContextPermission>()
      }
    },
    tools: data.tools
  } satisfies IContextMockedDataWithPermission;
}

export async function createPermissions(
  app: AppInstance,
  id: number,
  headers: IncomingHttpHeaders,
  payload: Partial<IAnyContextPermissionIn>
) {
  mockAuthFindMany(app);
  const response = await app.inject({
    method: 'POST',
    headers,
    url: `/contexts/${id}/permissions`,
    payload: { ...payload, contextId: id }
  });

  return response;
}

async function createPermissionsSafely(
  app: AppInstance,
  id: number,
  headers: IncomingHttpHeaders,
  payload: Partial<IAnyContextPermissionIn>
) {
  try {
    const response = await createPermissions(app, id, headers, payload);

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
