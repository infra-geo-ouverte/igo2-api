import * as Hapi from 'hapi';
import * as Boom from 'boom';
import { ILayerContext, LayerContextInstance } from './layerContext.model';
import { IDatabase } from '../database';
import { IServerConfigurations } from '../configurations';

export default class LayerContextController {

    private database: IDatabase;
    private configs: IServerConfigurations;

    constructor(configs: IServerConfigurations, database: IDatabase) {
        this.configs = configs;
        this.database = database;
    }

    public createLayerContext(request: Hapi.Request, reply: Hapi.IReply) {
        const newLayerContext: ILayerContext = request.payload;
        this.database.layerContext.create(newLayerContext)
        .then((layerContext) => {
            reply(layerContext).code(201);
        }).catch((error) => {
            reply(Boom.badImplementation(error));
        });
    }

    public updateLayerContext(request: Hapi.Request, reply: Hapi.IReply) {
        const id = request.params['id'];
        const layerContext: ILayerContext = request.payload;

        this.database.layerContext.update(layerContext, {
            where: {
              id: id
            }
          }).then((count: [number, LayerContextInstance[]]) => {
              if (count[0]) {
                  reply({});
              } else {
                  reply(Boom.notFound());
              }
          }).catch((error) => {
              reply(Boom.badImplementation(error));
        });
    }

    public deleteLayerContext(request: Hapi.Request, reply: Hapi.IReply) {
      const id = request.params['id'];
      this.database.layerContext.destroy({
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

    public getLayerContextById(request: Hapi.Request, reply: Hapi.IReply) {
        const id = request.params['id'];
        this.database.layerContext.findOne({
          where: {
            id: id
          }
        }).then((layerContext: LayerContextInstance) => {
            if (layerContext) {
                reply(layerContext);
            } else {
                reply(Boom.notFound());
            }
        }).catch((error) => {
            reply(Boom.badImplementation(error));
        });
    }

    public getLayerContexts(request: Hapi.Request, reply: Hapi.IReply) {
        this.database.layerContext.findAll()
        .then((layerContexts: Array<LayerContextInstance>) => {
            reply(layerContexts);
        }).catch((error) => {
            reply(Boom.badImplementation(error));
        });
    }
}
