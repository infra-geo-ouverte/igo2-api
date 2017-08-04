import * as Hapi from 'hapi';
import * as Boom from 'boom';

import { IDatabase } from '../database';
import { IServerConfiguration } from '../configurations';
import { ObjectUtils } from '../utils';

import { User } from '../users';
import { ILayer, LayerInstance } from './layer.model';

export default class LayerController {

  private database: IDatabase;
  private configs: IServerConfiguration;

  constructor(configs: IServerConfiguration, database: IDatabase) {
    this.configs = configs;
    this.database = database;
  }

  public createLayer(request: Hapi.Request, reply: Hapi.IReply) {
    const newLayer: ILayer = request.payload;
    const idUser = request.headers['x-consumer-id'];

    User.getProfils(idUser).subscribe((profils) => {
      // TODO: users must be able to add layers
      if (profils.includes(this.configs.adminProfil)) {
        this.database.layer.create(newLayer).then((layer) => {
          reply(layer).code(201);
        }).catch((error) => {
          reply(Boom.badImplementation(error));
        });
      } else {
        reply(Boom.unauthorized());
      }
    });
  }

  public updateLayer(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['id'];
    const layer: ILayer = request.payload;
    const idUser = request.headers['x-consumer-id'];

    User.getProfils(idUser).subscribe((profils) => {
      if (profils.includes(this.configs.adminProfil)) {
        this.database.layer.update(layer, {
          where: {
            id: id
          }
        }).then((count: [number, LayerInstance[]]) => {
          if (count[0]) {
            reply({
              id: id
            });
          } else {
            reply(Boom.notFound());
          }
        }).catch((error) => {
          reply(Boom.badImplementation(error));
        });
      } else {
        reply(Boom.unauthorized());
      }
    });
  }

  public deleteLayer(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['id'];
    const idUser = request.headers['x-consumer-id'];

    User.getProfils(idUser).subscribe((profils) => {
      if (profils.includes(this.configs.adminProfil)) {
        this.database.layer.destroy({
          where: {
            id: id
          }
        }).then((count: number) => {
          if (count) {
            reply({}).code(204);
          } else {
            reply(Boom.notFound());
          }
        }).catch((error) => {
          reply(Boom.badImplementation(error));
        });
      } else {
        reply(Boom.unauthorized());
      }
    });
  }

  public getLayerById(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['id'];
    const idUser = request.headers['x-consumer-id'];

    User.getProfils(idUser).subscribe((profils) => {
      if (profils.includes(this.configs.adminProfil)) {
        this.database.layer.findOne({
          where: {
            id: id
          }
        }).then((layer: LayerInstance) => {
          if (layer) {
            reply(ObjectUtils.removeNull(layer.get()));
          } else {
            reply(Boom.notFound());
          }
        }).catch((error) => {
          reply(Boom.badImplementation(error));
        });
      } else {
        reply(Boom.unauthorized());
      }
    });
  }

  public getLayers(request: Hapi.Request, reply: Hapi.IReply) {
    const idUser = request.headers['x-consumer-id'];

    User.getProfils(idUser).subscribe((profils) => {
      if (profils.includes(this.configs.adminProfil)) {
        this.database.layer.findAll()
          .then((layers: Array<LayerInstance>) => {
            const plainLayers = layers.map(
              (layer) => ObjectUtils.removeNull(layer.get())
            );
            reply(plainLayers);
          }).catch((error) => {
            reply(Boom.badImplementation(error));
          });
      } else {
        reply(Boom.unauthorized());
      }
    });
  }
}
