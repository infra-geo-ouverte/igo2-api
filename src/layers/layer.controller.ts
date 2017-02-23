import * as Hapi from 'hapi';
import * as Boom from 'boom';
import { ILayer, LayerInstance } from './layer.model';
import { IDatabase } from '../database';
import { IServerConfigurations } from '../configurations';

export default class LayerController {

    private database: IDatabase;
    private configs: IServerConfigurations;

    constructor(configs: IServerConfigurations, database: IDatabase) {
        this.configs = configs;
        this.database = database;
    }

    public createLayer(request: Hapi.Request, reply: Hapi.IReply) {
        const newLayer: ILayer = request.payload;
        this.database.layer.create(newLayer).then((layer) => {
            reply(layer).code(201);
        }).catch((error) => {
            reply(Boom.badImplementation(error));
        });
    }

    public updateLayer(request: Hapi.Request, reply: Hapi.IReply) {
        const id = request.params['id'];
        const layer: ILayer = request.payload;

        this.database.layer.update(layer, {
            where: {
              id: id
            }
          }).then((count: [number, LayerInstance[]]) => {
              if (count[0]) {
                  reply({});
              } else {
                  reply(Boom.notFound());
              }
          }).catch((error) => {
              reply(Boom.badImplementation(error));
        });
    }

    public deleteLayer(request: Hapi.Request, reply: Hapi.IReply) {
      const id = request.params['id'];
      this.database.layer.destroy({
        where: {
          id: id
        }
      }).then((count: number) => {
          if (count) {
              reply({});
          } else {
              reply(Boom.notFound());
          }
      }).catch((error) => {
          reply(Boom.badImplementation(error));
      });
    }

    public getLayerById(request: Hapi.Request, reply: Hapi.IReply) {
        const id = request.params['id'];
        this.database.layer.findOne({
          where: {
            id: id
          }
        }).then((layer: LayerInstance) => {
            if (layer) {
                reply(layer);
            } else {
                reply(Boom.notFound());
            }
        }).catch((error) => {
            reply(Boom.badImplementation(error));
        });
    }

    public getLayers(request: Hapi.Request, reply: Hapi.IReply) {
        this.database.layer.findAll()
        .then((layers: Array<LayerInstance>) => {
            reply(layers);
        }).catch((error) => {
            reply(Boom.badImplementation(error));
        });
    }
}
