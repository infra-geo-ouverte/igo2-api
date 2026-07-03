import { IncomingHttpHeaders } from 'http';

import { AppInstance } from '../../app.interface';
import { ADMIN_GROUP } from '../../auth';
import { HEADERS_ADMIN } from '../../auth/test/auth.mock';
import { ITool, IToolIn } from '../tool.interface';

export const TOOL_MOCK: IToolIn = {
  name: 'dummyName',
  title: 'dummyTitle',
  inToolbar: true,
  options: {},
  tooltip: 'dummyTooltip',
  icon: 'dummyIcon',
  global: true,
  order: 1,
  profils: ['dummyProfils', ADMIN_GROUP],
  createdAt: new Date(),
  updatedAt: new Date()
};

export const TOOL_MOCK_2: IToolIn = {
  name: 'Tool2',
  title: 'TitleTool2',
  inToolbar: true,
  options: {},
  tooltip: 'dummyTooltip',
  icon: 'dummyIcon',
  global: true,
  order: 1,
  profils: ['dummyProfils', ADMIN_GROUP],
  createdAt: new Date(),
  updatedAt: new Date()
};
export const TOOL_MOCK_3: IToolIn = {
  name: 'Tool3',
  title: 'TitleTool3',
  inToolbar: true,
  options: {},
  tooltip: 'dummyTooltip',
  icon: 'dummyIcon',
  global: true,
  order: 1,
  profils: ['dummyProfils', ADMIN_GROUP],
  createdAt: new Date(),
  updatedAt: new Date()
};

export async function appendTools(app: AppInstance) {
  const promises = [
    await createMockTool(app, HEADERS_ADMIN, TOOL_MOCK),
    await createMockTool(app, HEADERS_ADMIN, TOOL_MOCK_2),
    await createMockTool(app, HEADERS_ADMIN, TOOL_MOCK_3)
  ];
  const result = await Promise.all(promises);
  return result.map((layer) => layer.json<ITool>());
}

export async function createMockTool(
  app: AppInstance,
  headers: IncomingHttpHeaders,
  payload: IToolIn
) {
  const response = await app.inject({
    method: 'POST',
    headers,
    url: `/tools`,
    payload
  });

  return response;
}
