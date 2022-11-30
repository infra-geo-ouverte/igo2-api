import * as Boom from '@hapi/boom';

import { ObjectUtils } from '@igo2/base-api';

import { IProfilIgo } from './profilIgo.interface';
import { ProfilIgo } from './profilIgo.model';

export class ProfilIgoService {
  public async create (profilIgo: IProfilIgo): Promise<ProfilIgo> {
    return await ProfilIgo.create(profilIgo);
  }

  public async update (profilName: string, profilIgo: IProfilIgo): Promise<{ name: string }> {
    return await ProfilIgo
      .update(profilIgo, {
        where: {
          name: profilName
        }
      })
      .then((count: [number]) => {
        if (!count[0]) {
          throw Boom.notFound();
        }
        return { name: profilName };
      });
  }

  public async delete (profilName: string): Promise<void> {
    return await ProfilIgo
      .destroy({
        where: {
          name: profilName
        }
      })
      .then((count: number) => {
        if (!count) {
          throw Boom.notFound();
        }
      });
  }

  public async get (): Promise<ProfilIgo[]> {
    return await ProfilIgo.findAll({ order: ['id'] }).then((profilsIgo: ProfilIgo[]) => {
      return profilsIgo.map(profil => ObjectUtils.removeNull(profil.get()));
    });
  }

  public async getById (profilName: string): Promise<ProfilIgo> {
    return await ProfilIgo
      .findOne({
        where: {
          name: profilName
        }
      })
      .then((profilIgo: ProfilIgo) => {
        if (!profilIgo) {
          throw Boom.notFound();
        }
        return ObjectUtils.removeNull(profilIgo.get());
      });
  }

  public async getByProfils (profils: string[]): Promise<{ [key: string]: any }> {
    return await ProfilIgo
      .findAll({
        where: {
          name: profils
        },
        order: [['id', 'DESC']]
      })
      .then((profilsIgo: ProfilIgo[]) => {
        return profilsIgo.map(profil => profil.get());
      });
  }
}
