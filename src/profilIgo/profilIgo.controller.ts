import * as Hapi from 'hapi';
import * as Boom from 'boom';

import { handleError } from '../utils';
import { UserApi, UserInstance } from '../user';
import { ProfilIgo } from './profilIgo';
import { IProfilIgo } from './profilIgo.model';

export class ProfilIgoController {
  private profilIgo: ProfilIgo;

  constructor() {
    this.profilIgo = new ProfilIgo();
  }

  public async create(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const profilIgoToCreate: IProfilIgo = request.payload as IProfilIgo;
    const res = await this.profilIgo.create(profilIgoToCreate).catch(handleError);

    return h.response(res).code(201);
  }

  public async update(request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const profilName = (request.params as any).name;
    const profilIgoToUpdate: IProfilIgo = request.payload as IProfilIgo;

    return await this.profilIgo.update(profilName, profilIgoToUpdate).catch(handleError);
  }

  public async delete(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const profilName = (request.params as any).name;
    await this.profilIgo.delete(profilName).catch(handleError);

    return h.response().code(204);
  }

  public async get(request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const id = request.headers['x-consumer-id'];

    const profils: string[] = await UserApi.getProfils(id).catch(() => []);

    return (await this.profilIgo.get().catch(handleError)).filter(p => profils.includes(p.name));
  }

  public async getById(request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const id = request.headers['x-consumer-id'];
    const profilName = (request.params as any).name;

    const profils: string[] = await UserApi.getProfils(id).catch(() => []);
    if (!profils.includes(profilName)) {
      throw Boom.notFound();
    }

    return await this.profilIgo.getById(profilName).catch(handleError);
  }

  public async getProfilsAndUsers(request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const id = request.headers['x-consumer-id'];
    const q = request.query['q'] ? request.query['q'].normalize('NFD').replace(/[\u0300-\u036f]/g, '') : undefined;
    const qRE = q ? new RegExp(q, 'gi') : undefined;

    const profils: string[] = await UserApi.getProfils(id).catch(() => []);
    const profilsIgo = (await this.profilIgo.get().catch(handleError)).filter(
      p =>
        profils.includes(p.name) &&
        (!q ||
          p.name
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .search(qRE) !== -1 ||
          p.title
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .search(qRE) !== -1)
    );

    const usersIgo = await UserApi.getAllUsers(q)
      .then((users: UserInstance[]) => {
        return users.map(u => {
          return {
            name: u.sourceId,
            title: u.firstName && u.lastName ? u.firstName + ' ' + u.lastName : u.sourceId
          };
        });
      })
      .catch(() => []);

    return profilsIgo.concat(usersIgo);
  }
}
