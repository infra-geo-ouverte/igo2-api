import * as Hapi from 'hapi';
import * as Boom from 'boom';

import { IDatabase, database } from '../database';
import { ObjectUtils, uuid, handleError } from '../utils';

import { UserApi } from '../user';
import { UserIgo, IUserIgo } from '../userIgo';
import { TypePermission, ContextPermission } from '../contextPermission';
import { ToolContext } from '../toolContext';
import { LayerContext } from '../layerContext';

import { IContext, Context, Scope } from './index';

export class ContextController {
  private database: IDatabase = database;
  private context: Context;
  private contextPermission: ContextPermission;
  private toolContext: ToolContext;
  private layerContext: LayerContext;
  private userIgo: UserIgo;

  constructor() {
    this.contextPermission = new ContextPermission();
    this.context = new Context();
    this.toolContext = new ToolContext();
    this.layerContext = new LayerContext();
    this.userIgo = new UserIgo();
  }

  public async create(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const newContext: any = request.payload;
    newContext.owner = request.headers['x-consumer-username'];

    const context = await this.context.create(newContext).catch(handleError);
    if (newContext.tools) {
      await this.toolContext.bulkCreate(context.id, newContext.tools);
    }
    if (newContext.layers) {
      await this.layerContext.bulkCreate(
        context.id,
        this.mapLayersOptions(newContext.layers),
        true,
        true
      );
    }

    return h.response(context).code(201);
  }

  public async clone(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const owner = request.headers['x-consumer-username'];
    const id = request.params['contextId'];
    let properties = request.payload;
    if (typeof request.payload === 'string') {
      properties = JSON.parse(request.payload);
    }

    const context = await this.context
      .getById(id, owner, true, true)
      .catch(handleError);

    Object.assign(context, properties);
    const newContext = {
      scope: Scope[Scope.private],
      uri: uuid(),
      title: context.title,
      icon: context.icon,
      map: context.map,
      tools: context.tools,
      layers: context.layers
    };
    (request as any).payload = newContext;
    return await this.create(request, h);
  }

  public async update(request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const id = request.params['contextId'];
    const newContext: any = request.payload;

    const context = await this.context
      .update(id, newContext as IContext)
      .catch(handleError);

    if (newContext.tools) {
      await this.toolContext.deleteByContextId(context.id).catch(handleError);
      await this.toolContext.bulkCreate(context.id, newContext.tools);
    }
    if (newContext.layers) {
      await this.layerContext.deleteByContextId(context.id).catch(handleError);
      await this.layerContext.bulkCreate(
        context.id,
        this.mapLayersOptions(newContext.layers),
        true,
        true
      );
    }
    return context;
  }

  public async delete(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const id = request.params['contextId'];
    await this.context.delete(id);
    return h.response().code(204);
  }

  public async getById(request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const owner = request.headers['x-consumer-username'];
    const id = request.params['contextId'];
    const context = await this.context.getById(id, owner).catch(handleError);
    const permission = await this.contextPermission.getPermission(
      context,
      owner
    );

    if (!permission) {
      throw Boom.unauthorized();
    }
    context.permission = TypePermission[permission];
    return context;
  }

  public async get(request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const owner = request.headers['x-consumer-username'];
    const isAnonyme = request.headers['x-anonymous-consumer'];
    const id = request.headers['x-consumer-id'];

    const profils: string[] = await UserApi.getProfils(id).catch(() => []);
    if (owner) {
      profils.push(owner);
    }

    const promises = [];
    if (owner && !isAnonyme) {
      promises.push(
        this.database.context.findAll({
          where: {
            owner: owner
          }
        })
      );
    } else {
      promises.push([]);
    }

    if (profils && profils.length) {
      promises.push(
        this.database.context.findAll({
          include: [
            {
              model: this.database.contextPermission,
              where: {
                profil: profils
              }
            }
          ],
          where: {
            scope: 'protected',
            owner: {
              $ne: owner
            }
          }
        })
      );
    } else {
      promises.push([]);
    }

    promises.push(
      this.database.context.findAll({
        include: [
          {
            model: this.database.contextPermission,
            required: false,
            where: {
              profil: profils
            }
          }
        ],
        where: {
          scope: 'public',
          owner: {
            $ne: owner
          }
        }
      })
    );

    const repPromises = await Promise.all(promises);
    const oursPromises = repPromises[0];
    const sharedPromises = repPromises[1];
    const publicPromises = repPromises[2] || [];

    const oursContexts = oursPromises.map(c => {
      const plainC = c.get();
      plainC.permission = TypePermission[TypePermission.write];
      return ObjectUtils.removeNull(plainC);
    });
    const sharedContexts = sharedPromises.map(c => {
      const plainC = c.get();

      plainC.permission = TypePermission[TypePermission.read];
      for (const cp of plainC['contextPermissions']) {
        const typePerm: any = cp.typePermission;
        if (typePerm === TypePermission[TypePermission.write]) {
          plainC.permission = TypePermission[TypePermission.write];
          break;
        }
      }

      delete plainC['contextPermissions'];
      return ObjectUtils.removeNull(plainC);
    });
    const publicContexts = publicPromises
      .map(c => {
        const plainC: any = c.get();
        if (!plainC.contextPermissions.length && plainC.owner !== 'admin') {
          return;
        }
        plainC.permission = TypePermission[TypePermission.read];
        for (const cp of plainC['contextPermissions']) {
          const typePerm: any = cp.typePermission;
          if (typePerm === TypePermission[TypePermission.write]) {
            plainC.permission = TypePermission[TypePermission.write];
            break;
          }
        }

        delete plainC['contextPermissions'];
        return ObjectUtils.removeNull(plainC);
      })
      .filter(c => c);

    return {
      ours: oursContexts,
      shared: sharedContexts,
      public: publicContexts
    };
  }

  public async getDetailsById(request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const owner = request.headers['x-consumer-username'];
    const id = request.params['contextId'];

    const contextDetails = await this.context
      .getById(id, owner, true, true)
      .catch(handleError);

    const permission = await this.contextPermission
      .getPermission(contextDetails, owner)
      .catch(handleError);

    if (!permission) {
      const msg = 'Must have read permission for this context';
      throw Boom.forbidden(msg);
    }
    contextDetails.permission = TypePermission[permission];
    return contextDetails;
  }

  public async getDefault(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const customId = request.headers['x-consumer-custom-id'];

    const user = await this.userIgo.get(customId).catch(() => {
      return {
        defaultContextId: 'default'
      };
    });

    request.params['contextId'] = user.defaultContextId;
    return await this.getDetailsById(request, h);
  }

  public async setDefaultContext(
    request: Hapi.Request,
    h: Hapi.ResponseToolkit
  ) {
    const userId = request.headers['x-consumer-custom-id'];
    const userIgoToCreate: IUserIgo = request.payload as IUserIgo;
    const userIGO = await this.userIgo.get(userId).catch(() => {});

    if (userIGO) {
      return await this.userIgo.update(userId, userIgoToCreate)
        .catch(handleError);
    } else {
      userIgoToCreate.userId = userId;
      return await this.userIgo.create(userIgoToCreate).catch(handleError);
    }
  }

  private mapLayersOptions(layersToConvert) {
    const layers = [];
    for (const layer of layersToConvert) {
      const sourceOptions = layer.sourceOptions;
      const layerOptions = Object.assign({}, layer, layer.layerOptions, {
        sourceOptions: undefined
      });
      layers.push({
        id: layer.id,
        sourceOptions: sourceOptions,
        layerOptions: layerOptions
      });
    }

    return layers;
  }
}
