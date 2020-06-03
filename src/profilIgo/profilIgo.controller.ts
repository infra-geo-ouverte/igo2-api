import * as Hapi from 'hapi';
import * as Boom from 'boom';

import { handleError } from '../utils';
import { UserApi } from '../user';
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
}
