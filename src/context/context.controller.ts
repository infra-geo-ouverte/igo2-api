import * as Hapi from '@hapi/hapi';
import * as Boom from '@hapi/boom';
import { Op } from 'sequelize';
import { ObjectUtils, uuid } from '@igo2/base-api';
import { handleError, HapiRequestToUser } from '../utils';

import { UserApi } from '../user';
import { UserIgoService, IUserIgo } from '../userIgo';
import { TypePermission, ContextPermissionService, ContextPermission } from '../contextPermission';
import { ContextHidden } from '../contextHidden';
import { ToolContextService } from '../toolContext/toolContext.service';
import { LayerContextService } from '../layerContext/layerContext.service';
import { ContextAccessService } from '../contextAccess/contextAccess.service';

import { IContext, ContextService, Context, Scope } from './index';
import { Config } from '@igo2/base-api';
import { CredentialsConfig } from '../configurations';

export class ContextController {
  private contextService: ContextService;
  private contextPermissionService: ContextPermissionService;
  private toolContextService: ToolContextService;
  private layerContextService: LayerContextService;
  private contextAccessService: ContextAccessService;
  private userIgoService: UserIgoService;

  constructor () {
    this.contextPermissionService = new ContextPermissionService();
    this.contextService = new ContextService();
    this.toolContextService = new ToolContextService();
    this.layerContextService = new LayerContextService();
    this.userIgoService = new UserIgoService();
    this.contextAccessService = new ContextAccessService();
  }

  public async create (request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const newContext: any = request.payload;
    const requestedUser = HapiRequestToUser(request);
    newContext.owner = requestedUser.sourceId;

    const context = await this.contextService.create(newContext).catch(handleError);
    if (newContext.tools) {
      await this.toolContextService.bulkCreate(context.id, newContext.tools);
    }
    if (newContext.layers) {
      await this.layerContextService.bulkCreate(context.id, newContext.layers, true, true);
    }

    return h.response(context).code(201);
  }

  public async clone (request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const requestedUser = HapiRequestToUser(request);
    const owner = requestedUser.sourceId;
    const id = request.params.contextId;
    let properties = request.payload;
    if (typeof request.payload === 'string') {
      properties = JSON.parse(request.payload);
    }

    const context = await this.contextService.getById(id, owner, true, true).catch(handleError);

    Object.assign(context, properties);
    const newContext = {
      scope: Scope[Scope.private],
      uri: uuid(),
      title: context.title,
      icon: context.icon,
      map: context.map,
      tools: context.tools,
      layers: context.layers.map((l) => {
        const layerOptions = Object.assign({}, l);
        delete layerOptions.sourceOptions;
        return {
          layerOptions,
          sourceOptions: l.sourceOptions
        };
      })
    };
    (request as any).payload = newContext;
    return await this.create(request, h);
  }

  public async update (request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const id = request.params.contextId;
    const newContext: any = request.payload;

    const context = await this.contextService.update(id, newContext as IContext).catch(handleError);

    if (newContext.tools) {
      await this.toolContextService.deleteByContextId(context.id).catch(handleError);
      await this.toolContextService.bulkCreate(context.id, newContext.tools);
    }
    if (newContext.layers) {
      await this.layerContextService.deleteByContextId(context.id).catch(handleError);
      await this.layerContextService.bulkCreate(context.id, newContext.layers, true, true);
    }
    return context;
  }

  public async delete (request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const id = request.params.contextId;
    await this.contextService.delete(id);
    return h.response().code(204);
  }

  public async getById (request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const requestedUser = HapiRequestToUser(request);
    const owner = requestedUser.sourceId;
    const id = request.params.contextId;
    const context = await this.contextService.getById(id, owner).catch(handleError);
    const permission = await this.contextPermissionService.getPermission(context, owner);

    if (!permission) {
      throw Boom.unauthorized();
    }
    context.permission = TypePermission[permission];
    return context;
  }

  public async get (request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const cc = Config.getConfig('credentials') as CredentialsConfig;
    const pco = cc.publicContextOwner || 'admin';
    
    const requestedUser = HapiRequestToUser(request);
    const {
      randomUUID
    } = await import('node:crypto');

    let owner = `anonymous-${randomUUID()}`;
    let isAnonyme = false;
    let id = `anonymous-${randomUUID()}`;

    if (!requestedUser) {
      isAnonyme = true;
    } else {
      id = requestedUser.id;
      owner = requestedUser.sourceId;
    }
    const permissions = request.query.permission;
    const showHidden = request.query.hidden;

    let profils = (await UserApi.getProfils(id).catch(() => [])) as string[];

    if (owner) {
      profils.push(owner);
    }

    profils = profils.filter((p) => !permissions || permissions.includes(p));

    const promises = [];
    if (owner && !isAnonyme) {
      promises.push(
        Context.findAll({
          include: [
            {
              // @ts-ignore
              model: ContextHidden,
              required: false,
              where: {
                user: owner
              }
            }
          ],
          where: {
            owner
          },
          order: [['createdAt', 'DESC']]
        })
      );
    } else {
      promises.push([]);
    }

    if (profils && profils.length) {
      promises.push(
        Context.findAll({
          include: [
            {
              // @ts-ignore
              model: ContextPermission,
              where: {
                profil: profils
              }
            },
            {
              // @ts-ignore
              model: ContextHidden,
              required: false,
              where: {
                user: owner
              }
            }
          ],
          where: {
            scope: 'protected',
            owner: {
              [Op.ne]: owner
            }
          },
          order: [['createdAt', 'DESC']]
        })
      );
    } else {
      promises.push([]);
    }

    if (!permissions || permissions.includes('public')) {
      promises.push(
        Context.findAll({
          include: [
            {
              // @ts-ignore
              model: ContextPermission,
              required: false,
              where: {
                profil: profils
              }
            },
            {
              // @ts-ignore
              model: ContextHidden,
              required: false
              /*     where: {
                user: owner
              } */
            }
          ],
          where: {
            scope: 'public',
            owner: {
              [Op.ne]: owner
            }
          },
          order: [['createdAt', 'DESC']]
        })
      );
    } else {
      promises.push([]);
    }

    const repPromises = await Promise.all(promises);
    const oursPromises = repPromises[0];
    const sharedPromises = repPromises[1] || [];
    const publicPromises = repPromises[2] || [];

    const oursContexts = oursPromises
      .filter((c) => {
        return showHidden || !c.dataValues.contextHiddens.length;
      })
      .map((c) => {
        const plainC = c.get();
        plainC.permission = TypePermission[TypePermission.write];
        plainC.hidden = !!c.contextHiddens.length;

        delete plainC.contextHiddens;
        return ObjectUtils.removeNull(plainC);
      });

    const sharedContexts = sharedPromises
      .filter((c) => {
        return showHidden || !c.dataValues.contextHiddens.length;
      })
      .map((c) => {
        const plainC = c.get();

        plainC.permission = TypePermission[TypePermission.read];
        plainC.hidden = !!c.contextHiddens.length;

        for (const cp of plainC.contextPermissions) {
          const typePerm: any = cp.typePermission;
          if (typePerm === TypePermission[TypePermission.write]) {
            plainC.permission = TypePermission[TypePermission.write];
            break;
          }
        }

        delete plainC.contextPermissions;
        delete plainC.contextHiddens;
        return ObjectUtils.removeNull(plainC);
      });

    const publicContexts = publicPromises
      .filter((c) => {
        return showHidden || !c.dataValues.contextHiddens.length;
      })
      .map((c) => {
        const plainC: any = c.get();
        if (!plainC.contextPermissions.length && plainC.owner !== pco) {
          return;
        }

        plainC.permission = TypePermission[TypePermission.read];
        plainC.hidden = !!c.contextHiddens.length;

        for (const cp of plainC.contextPermissions) {
          const typePerm: any = cp.typePermission;
          if (typePerm === TypePermission[TypePermission.write]) {
            plainC.permission = TypePermission[TypePermission.write];
            break;
          }
        }

        delete plainC.contextPermissions;
        delete plainC.contextHiddens;
        return ObjectUtils.removeNull(plainC);
      })
      .filter((c) => c);

    return {
      ours: oursContexts,
      shared: sharedContexts,
      public: publicContexts
    };
  }

  public async getDetailsById (request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const requestedUser = HapiRequestToUser(request);
    const owner = requestedUser ? requestedUser.sourceId : undefined;
    const id = request.params.contextId;

    const contextDetails = await this.contextService.getById(id, owner, true, true).catch(handleError);

    const permission = await this.contextPermissionService.getPermission(contextDetails, owner).catch(handleError);

    if (!permission) {
      const msg = 'Must have read permission for this context';
      throw Boom.forbidden(msg);
    }
    contextDetails.permission = TypePermission[permission];

    this.contextAccessService.update(contextDetails.id);
    return contextDetails;
  }

  public async getDefault (request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const requestedUser = HapiRequestToUser(request);
    const userId = requestedUser.id;

    const user = await this.userIgoService.get(userId).catch(() => {
      return {
        defaultContextId: 'default'
      };
    });

    request.params.contextId = user.defaultContextId;
    return await this.getDetailsById(request, h).catch(async () => {
      request.params.contextId = 'default';
      const defaultContext = await this.getDetailsById(request, h);
      this.userIgoService.update(userId, { defaultContextId: defaultContext.id });
      return defaultContext;
    });
  }

  public async setDefaultContext (request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const requestedUser = HapiRequestToUser(request);
    const userId = requestedUser.id;
    const userIgoToCreate: IUserIgo = request.payload as IUserIgo;
    const userIGO = await this.userIgoService.get(userId).catch(() => {});

    if (userIGO) {
      return await this.userIgoService.update(userId, userIgoToCreate).catch(handleError);
    } else {
      userIgoToCreate.userId = userId;
      return await this.userIgoService.create(userIgoToCreate).catch(handleError);
    }
  }
}
