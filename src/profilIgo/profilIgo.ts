import * as Boom from 'boom';

import { IDatabase, database } from '../database';
import { ObjectUtils } from '../utils';

import { IProfilIgo, ProfilIgoInstance } from './profilIgo.model';

export class ProfilIgo {
  private database: IDatabase = database;

  constructor() {}

  public async create(profilIgo: IProfilIgo): Promise<ProfilIgoInstance> {
    return await this.database.profilIgo.create(profilIgo);
  }

  public async update(profilName: string, profilIgo: IProfilIgo): Promise<{ name: string }> {
    return await this.database.profilIgo
      .update(profilIgo, {
        where: {
          name: profilName
        }
      })
      .then((count: [number, ProfilIgoInstance[]]) => {
        if (!count[0]) {
          throw Boom.notFound();
        }
        return { name: profilName };
      });
  }

  public async delete(profilName: string): Promise<void> {
    return await this.database.profilIgo
      .destroy({
        where: {
          name: profilName
        }
      })
      .then((count: number) => {
        if (!count) {
          throw Boom.notFound();
        }
        return;
      });
  }

  public async get(): Promise<ProfilIgoInstance[]> {
    return await this.database.profilIgo.findAll({ order: ['id'] }).then((profilsIgo: ProfilIgoInstance[]) => {
      return profilsIgo.map(profil => ObjectUtils.removeNull(profil.get()));
    });
  }

  public async getById(profilName: string): Promise<ProfilIgoInstance> {
    return await this.database.profilIgo
      .findOne({
        where: {
          name: profilName
        }
      })
      .then((profilIgo: ProfilIgoInstance) => {
        if (!profilIgo) {
          throw Boom.notFound();
        }
        return ObjectUtils.removeNull(profilIgo.get());
      });
  }

  public async getByProfils(profils: string[]): Promise<{ [key: string]: any }> {
    return await this.database.profilIgo
      .findAll({
        where: {
          name: profils
        },
        order: [['id', 'DESC']]
      })
      .then((profilsIgo: ProfilIgoInstance[]) => {
        return profilsIgo.map(profil => profil.get());
      });
  }
}
