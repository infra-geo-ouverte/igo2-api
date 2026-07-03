import { FastifyInstance } from 'fastify';

import axios from 'axios';
import { AxiosError } from 'axios';

import { IAuthApi, IAuthEnv, IAuthUser } from './authentication.interface';

type IAuthFastifyInstance = FastifyInstance & {
  env: IAuthEnv;
};

export const AuthClient = axios.create({
  paramsSerializer: {
    indexes: null
  }
});

export class AuthenticationApi implements IAuthApi {
  constructor(private app: IAuthFastifyInstance) {
    AuthClient.defaults.baseURL = this.app.env.AUTH_API;
  }

  async getUserById(id: number): Promise<IAuthUser | null> {
    try {
      const res = await AuthClient.get<IAuthUser>(`/users/${id}`);
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error.response?.data ?? error;
      }
      throw error;
    }
  }

  async findMany(ids: number[]): Promise<IAuthUser[]> {
    if (!ids.length) {
      return [];
    }
    try {
      const res = await AuthClient.get<IAuthUser[]>('/users', {
        params: {
          ids: ids
        },
        paramsSerializer: {
          indexes: null
        }
      });
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error.response?.data ?? error;
      }
      throw error;
    }
  }

  async searchUsers(
    limit = 10,
    filter: string | undefined
  ): Promise<IAuthUser[]> {
    try {
      const res = await AuthClient.get<IAuthUser[]>('/users/search', {
        params: {
          limit,
          q: filter
        }
      });
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error.response?.data ?? error;
      }
      throw error;
    }
  }
}
