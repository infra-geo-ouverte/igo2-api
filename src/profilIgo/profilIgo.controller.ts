import * as Hapi from '@hapi/hapi';
import * as Boom from '@hapi/boom';

import { handleError, HapiRequestToUser } from '../utils';
import { UserApi, User } from '../user';
import { ProfilIgoService } from './profilIgo.service';
import { IProfilIgo, IProfilIgoChilds } from './profilIgo.interface';

export class ProfilIgoController {
  private profilIgoService: ProfilIgoService;

  constructor () {
    this.profilIgoService = new ProfilIgoService();
  }

  public async create (request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const profilIgoToCreate: IProfilIgo = request.payload as IProfilIgo;
    const res = await this.profilIgoService.create(profilIgoToCreate).catch(handleError);

    return h.response(res).code(201);
  }

  public async update (request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const profilName = (request.params as any).name;
    const profilIgoToUpdate: IProfilIgo = request.payload as IProfilIgo;

    return await this.profilIgoService.update(profilName, profilIgoToUpdate).catch(handleError);
  }

  public async delete (request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const profilName = (request.params as any).name;
    await this.profilIgoService.delete(profilName).catch(handleError);

    return h.response().code(204);
  }

  public async get (request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const requestedUser = HapiRequestToUser(request);

    const profils: string[] = await UserApi.getProfils(requestedUser.id).catch(() => []);
    const user: User = await UserApi.getUser(requestedUser.sourceId);

    let profilIgo: IProfilIgo[] = (await this.profilIgoService.get().catch(handleError)).filter((p) =>
      profils.includes(p.name)
    );

    profilIgo = profilIgo.filter((p) => p.canFilter !== false);

    const regrProfils: IProfilIgoChilds[] = [
      {
        name: user.sourceId,
        title: `Partagé à ${user.firstName} ${user.lastName}`
      }
    ]
      .concat(
        profilIgo
          .filter((p) => !p.group)
          .map((p) => {
            return { name: p.name, title: p.title };
          })
      )
      .concat([
        {
          name: 'public',
          title: 'Public'
        }
      ]);

    profilIgo
      .filter((p) => p.group)
      .forEach((children) => {
        const parent = regrProfils.find((p) => p.name === children.group);
        const c = { name: children.name, title: children.title };
        if (parent) {
          parent.childs = (parent.childs ? parent.childs.concat([c]) : [c]) as IProfilIgo[];
        }
      });

    return regrProfils;
  }

  public async getById (request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const requestedUser = HapiRequestToUser(request);

    const profilName = (request.params as any).name;

    const profils: string[] = await UserApi.getProfils(requestedUser.id).catch(() => []);
    if (!profils.includes(profilName)) {
      throw Boom.notFound();
    }

    return await this.profilIgoService.getById(profilName).catch(handleError);
  }

  public async getProfilsAndUsers (request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const requestedUser = HapiRequestToUser(request);
    // unable to find names and profils with accent if q is normalized.. 
    // const q = request.query.q ? request.query.q.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : undefined;
    const q = request.query.q;
    const qRE = q ? new RegExp(q, 'gi') : undefined;

    const profils: string[] = await UserApi.getProfils(requestedUser.id).catch(() => []);

    const allProfilsIgo = await this.profilIgoService.get().catch(handleError);
    const profilIgoOfCurrentUser: IProfilIgo[] = allProfilsIgo.filter((p) => profils.includes(p.name));

    const canShare = profilIgoOfCurrentUser.find((p) => p.canShare === true);
    if (!canShare) {
      return [];
    }

    const canShareToProfils = [
      ...profilIgoOfCurrentUser.reduce(
        (accumulator, currentValue) =>
          accumulator.concat(currentValue.canShareToProfils ? currentValue.canShareToProfils : []),
        []
      )
    ];

    const profilIgo = allProfilsIgo
      .filter(
        (p) =>
          canShareToProfils.includes(p.id) &&
          (!q ||
            p.name
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .search(qRE) !== -1 ||
            p.title
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .search(qRE) !== -1)
      )
      .map((p) => {
        return { name: p.name, title: p.title };
      });

    const usersIgo = await UserApi.getAllUsers(request.query.limit, q)
      .then((users: User[]) => {
        return users.map((u) => {
          return {
            name: u.sourceId,
            title: u.firstName && u.lastName ? u.firstName + ' ' + u.lastName : u.sourceId
          };
        });
      })
      .catch(() => []);

    return profilIgo.concat(usersIgo);
  }
}
