import axios from 'axios';
import { AxiosError } from 'axios';

import { AppInstance } from '../../app.interface';
import { IAuthApi, IAuthUser } from './authentication.interface';

export const AuthClient = axios.create({
  paramsSerializer: {
    indexes: null
  }
});

export class AuthenticationApi implements IAuthApi {
  constructor(private app: AppInstance) {
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
