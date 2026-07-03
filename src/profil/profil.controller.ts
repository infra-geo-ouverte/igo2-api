import { Sanitizer } from '@igo2/base-api';

import { AppInstance, AppReply, AppRequest } from '../app.interface';
import { IAuthApi } from '../auth/authentication/authentication.interface';
import { IProfil, IProfilChilds, ISearchResult } from './profil.interface';
import {
  CreateProfilSchema,
  DeleteProfilSchema,
  GetAllProfilSchema,
  GetProfilSchema,
  GetUsersAndProfilsSchema,
  UpdateProfilSchema
} from './profil.schema';
import { ProfilService } from './profil.service';

export const PUBLIC_PROFIL: IProfilChilds = {
  name: 'public',
  title: 'Public'
};

export class ProfilController {
  private profilService: ProfilService;
  private authApi: IAuthApi;

  constructor(app: AppInstance) {
    this.profilService = new ProfilService(app);
    this.authApi = app.authApi;
  }

  create = async (
    request: AppRequest<typeof CreateProfilSchema>,
    reply: AppReply<typeof CreateProfilSchema>
  ) => {
    const profilIgoToCreate = request.body;

    const res = await this.profilService.create(profilIgoToCreate);
    return reply.code(201).send(res);
  };

  update = async (
    request: AppRequest<typeof UpdateProfilSchema>,
    reply: AppReply<typeof UpdateProfilSchema>
  ) => {
    const profilName = request.params.name;
    const profilIn = request.body;

    const profil = this.profilService.getByName(profilName);
    if (!profil) {
      return reply.notFound();
    }

    return this.profilService.update(profilName, profilIn);
  };

  delete = async (
    request: AppRequest<typeof DeleteProfilSchema>,
    reply: AppReply<typeof DeleteProfilSchema>
  ) => {
    const profilName = request.params.name;

    const profil = this.profilService.getByName(profilName);
    if (!profil) {
      return reply.notFound();
    }

    const result = await this.profilService.delete(profilName);
    return reply.code(204).send(result);
  };

  get = async (
    request: AppRequest<typeof GetAllProfilSchema>,
    reply: AppReply<typeof GetAllProfilSchema>
  ) => {
    const user = request.user;
    if (!user) {
      return reply.forbidden('Accès refusé');
    }
    const profils = user.profils;

    const externalUser = await (user.source === 'user'
      ? this.authApi.getUserById(Number(user.externalId))
      : undefined);

    let profilDb = await this.profilService.getByProfils(profils);

    if (profilDb.length > 200) {
      return reply.payloadTooLarge(
        'The number of user profiles is potentially too high'
      );
    }

    profilDb = profilDb.filter((p) => p.canFilter !== false);

    const regrProfils: IProfilChilds[] = [
      externalUser && {
        name: externalUser.sourceId,
        title: `Partagé à ${externalUser.firstName} ${externalUser.lastName}`
      }
    ]
      .concat(profilDb.filter((p) => !p.group))
      .concat([PUBLIC_PROFIL])
      .filter(Boolean) as IProfilChilds[];

    profilDb
      .filter((p) => p.group)
      .forEach((children) => {
        const parent = regrProfils.find((p) => p.name === children.group);
        if (parent) {
          if (!parent.childs) {
            parent.childs = [];
          }
          parent.childs.push(children);
        }
      });

    return regrProfils;
  };

  getByName = async (
    request: AppRequest<typeof GetProfilSchema>,
    reply: AppReply<typeof GetProfilSchema>
  ) => {
    const profilName = request.params.name;

    const user = request.user;
    if (!user) {
      return reply.forbidden('Accès refusé');
    }
    const profils = user.profils;
    if (!profils.includes(profilName)) {
      return reply.notFound();
    }

    const profil = this.profilService.getByName(profilName);
    if (!profil) {
      return reply.notFound();
    }

    return profil;
  };

  getProfilsAndUsers = async (
    request: AppRequest<typeof GetUsersAndProfilsSchema>,
    reply: AppReply<typeof GetUsersAndProfilsSchema>
  ): Promise<ISearchResult[]> => {
    const { q, limit = 10 } = request.query;
    const user = request.user;
    if (!user) {
      return reply.forbidden('Accès refusé');
    }
    const currentUserProfilNames = user.profils;

    const allProfils = await this.profilService.get();
    const currentUserProfils = allProfils.filter((p) =>
      currentUserProfilNames.includes(p.name)
    );

    if (!currentUserProfils.some((p) => p.canShare)) {
      return [];
    }

    const authorizedProfilIds = new Set(
      currentUserProfils.flatMap((p) => p.canShareToProfils ?? [])
    );

    const filteredProfils = this.getFilteredProfils(
      allProfils,
      authorizedProfilIds,
      q
    );
    const filteredUsers = await this.getFilteredUsers(limit, q);

    return [...filteredProfils, ...filteredUsers];
  };

  private getFilteredProfils(
    allProfils: IProfil[],
    authorizedIds: Set<number>,
    query?: string
  ): ISearchResult[] {
    if (!query) return [];

    const searchRegex = new RegExp(
      Sanitizer.escapeStringRegex(normalizeString(query)),
      'gi'
    );

    return allProfils
      .filter((p) => {
        if (p.id == null || !authorizedIds.has(p.id)) return false;

        const searchableText = `${normalizeString(p.name)} ${normalizeString(p.title)}`;
        return searchRegex.test(searchableText);
      })
      .map((p) => ({
        id: p.id!,
        name: p.name,
        title: p.title,
        type: 'profil'
      }));
  }

  private async getFilteredUsers(
    limit: number,
    query?: string
  ): Promise<ISearchResult[]> {
    const users = await this.authApi.searchUsers(limit, query);

    return users.map((u) => ({
      id: u.id,
      name: u.sourceId,
      title:
        u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.sourceId,
      type: 'user'
    }));
  }
}

const normalizeString = (str: string): string =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
