import nock from 'nock';

import { AppInstance } from '../../app.interface';
import { IAuthUser } from '../authentication/authentication.interface';
import { IHeaderConsumerRaw } from '../authentication/header-authentication';
import { ADMIN_GROUP } from '../authorization/authorization';

export const HEADERS_ADMIN: IHeaderConsumerRaw = {
  'x-consumer-id': '123456781',
  'x-consumer-username': 'king',
  'x-consumer-custom-id': '2',
  'x-consumer-groups': `all, ${ADMIN_GROUP}, privilege, another`
};

export const HEADERS_ANONYMOUS: IHeaderConsumerRaw = {
  'x-consumer-id': '123456782',
  'x-consumer-username': 'anonyme',
  'x-consumer-custom-id': '',
  'x-consumer-groups': 'all',
  'x-anonymous-consumer': 'true'
};

export const HEADERS_USER_1: IHeaderConsumerRaw = {
  'x-consumer-id': '123456783',
  'x-consumer-username': 'user1',
  'x-consumer-custom-id': '1',
  'x-consumer-groups': 'all, privilege, another, public'
};

export const HEADERS_USER_2: IHeaderConsumerRaw = {
  'x-consumer-id': '123456784',
  'x-consumer-username': 'user2',
  'x-consumer-custom-id': '3',
  'x-consumer-groups': 'all, another'
};

export const ALL_USERS_HEADERS = [
  HEADERS_ADMIN,
  HEADERS_ANONYMOUS,
  HEADERS_USER_1,
  HEADERS_USER_2
];

export function findHeaderByCustomId(
  id: number
): IHeaderConsumerRaw | undefined {
  return ALL_USERS_HEADERS.find(
    (header) => header['x-consumer-custom-id'] === id.toString()
  );
}

function createFromHeaders(headers: IHeaderConsumerRaw): IAuthUser {
  return {
    id: Number(headers['x-consumer-custom-id']),
    source: 'microsoft',
    sourceId: headers['x-consumer-username'],
    email: 'test',
    firstName: 'test',
    lastName: 'test'
  };
}

function appendMockUsers(): IAuthUser[] {
  return [
    createFromHeaders(HEADERS_USER_1),
    createFromHeaders(HEADERS_USER_2),
    createFromHeaders(HEADERS_ADMIN),
    createFromHeaders(HEADERS_ANONYMOUS)
  ];
}

export interface IUsersHeader {
  user1: IHeaderConsumerRaw;
  user2: IHeaderConsumerRaw;
  admin: IHeaderConsumerRaw;
  anonymous: IHeaderConsumerRaw;
}

export function getUserHeaders(): IUsersHeader {
  const users = appendMockUsers();
  return {
    user1: {
      ...HEADERS_USER_1,
      'x-consumer-custom-id': users[0].id!.toString()
    },
    user2: {
      ...HEADERS_USER_2,
      'x-consumer-custom-id': users[1].id!.toString()
    },
    admin: {
      ...HEADERS_ADMIN,
      'x-consumer-custom-id': users[2].id!.toString()
    },
    anonymous: {
      ...HEADERS_ANONYMOUS,
      'x-consumer-custom-id': ''
    }
  };
}

export function mockAuthFindMany(app: AppInstance, persist = false) {
  return nock(app.env.AUTH_API)
    .get(`/users`)
    .query(true)
    .reply(200, appendMockUsers())
    .persist(persist);
}
