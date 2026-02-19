import test from 'node:test';

import { eq } from 'drizzle-orm';
import { IncomingHttpHeaders } from 'http';

import { resetDatabase } from '../../../../scripts/src/seeder';
import { buildApp } from '../../../app';
import { AppInstance } from '../../../app.interface';
import { HEADERS_USER_1, HEADERS_USER_2 } from '../../../auth/test/auth.mock';
import { syncUsers } from '../../../user/test/user.mock';
import { IContext } from '../../context.interface';
import {
  IContextMockedDataWithPermission,
  appendContextsWithPermission
} from '../../permission/test/context-permission.mock';
import { IContextAccess } from '../context-access.interface';
import { contextAccessModel } from '../context-access.model';

test('Context Access', async (t) => {
  let app: AppInstance;
  let data: IContextMockedDataWithPermission;

  t.beforeEach(async () => {
    app = await buildApp();
    await resetDatabase(app);

    await syncUsers(app);
    data = await appendContextsWithPermission(app);
  });

  t.afterEach(async () => {
    await app.close();
  });

  // ===========================================================

  t.test(
    'Should create access record on first context retrieval',
    async (t) => {
      const context: IContext = data.user1[1].context;

      const response = await getContextDetails(HEADERS_USER_1, context.id!);
      t.assert.equal(response.statusCode, 200);

      const access = await getContextAccess(context.id!);
      t.assert.equal(!!access, true, 'Access record should be created');
      t.assert.equal(access?.contextId, context.id);
      t.assert.equal(access?.calls, 1);
    }
  );

  // ===================================

  t.test('Should increment calls on subsequent retrievals', async (t) => {
    const context: IContext = data.user1[1].context;

    // First retrieval
    await getContextDetails(HEADERS_USER_1, context.id!);
    let access = await getContextAccess(context.id!);
    t.assert.equal(access?.calls, 1);

    // Second retrieval
    await getContextDetails(HEADERS_USER_1, context.id!);
    access = await getContextAccess(context.id!);
    t.assert.equal(access?.calls, 2);

    // Third retrieval
    await getContextDetails(HEADERS_USER_1, context.id!);
    access = await getContextAccess(context.id!);
    t.assert.equal(access?.calls, 3);
  });

  // ===================================

  t.test('Should update accessedAt timestamp on each retrieval', async (t) => {
    const context: IContext = data.user2[4].context;

    // First retrieval
    await getContextDetails(HEADERS_USER_1, context.id!);
    const access1 = await getContextAccess(context.id!);
    const firstAccessedAt = access1?.accessedAt;

    // Small delay to ensure timestamp difference
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Second retrieval
    await getContextDetails(HEADERS_USER_1, context.id!);
    const access2 = await getContextAccess(context.id!);
    const secondAccessedAt = access2?.accessedAt;

    t.assert.equal(
      !!firstAccessedAt,
      true,
      'First access timestamp should exist'
    );
    t.assert.equal(
      !!secondAccessedAt,
      true,
      'Second access timestamp should exist'
    );
    t.assert.equal(
      secondAccessedAt!.getTime() > firstAccessedAt!.getTime(),
      true,
      'accessedAt should be updated'
    );
  });

  // ===================================

  t.test('Should handle multiple users accessing same context', async (t) => {
    const context: IContext = data.user2[4].context;

    // User 1 accesses
    await getContextDetails(HEADERS_USER_1, context.id!);
    let access = await getContextAccess(context.id!);
    t.assert.equal(access?.calls, 1);

    // User 2 accesses same context
    await getContextDetails(HEADERS_USER_2, context.id!);
    access = await getContextAccess(context.id!);
    t.assert.equal(
      access?.calls,
      2,
      'Calls should increment for same context regardless of user'
    );
  });

  // ===================================

  t.test(
    'Should handle context access for different contexts independently',
    async (t) => {
      const context1: IContext = data.user1[1].context;
      const context2: IContext = data.user2[2].context;

      // Access context 1
      await getContextDetails(HEADERS_USER_1, context1.id!);
      const access1 = await getContextAccess(context1.id!);
      t.assert.equal(access1?.calls, 1);

      // Access context 2
      await getContextDetails(HEADERS_USER_2, context2.id!);
      const access2 = await getContextAccess(context2.id!);
      t.assert.equal(access2?.calls, 1);

      // Access context 1 again
      await getContextDetails(HEADERS_USER_1, context1.id!);
      const access1Again = await getContextAccess(context1.id!);
      t.assert.equal(access1Again?.calls, 2);

      // Verify context 2 still has 1 call
      const access2Check = await getContextAccess(context2.id!);
      t.assert.equal(access2Check?.calls, 1);
    }
  );

  // ===================================

  async function getContextDetails(
    headers: IncomingHttpHeaders,
    contextId: number
  ) {
    const response = await app.inject({
      method: 'GET',
      url: `/contexts/${contextId}/details`,
      headers
    });

    return response;
  }

  async function getContextAccess(
    contextId: number
  ): Promise<IContextAccess | null> {
    const results = await app.db
      .select()
      .from(contextAccessModel)
      .where(eq(contextAccessModel.contextId, contextId));

    return results[0] || null;
  }
});
