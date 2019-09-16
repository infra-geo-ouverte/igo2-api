import * as Boom from 'boom';

import { IDatabase, database } from '../database';
import { ObjectUtils } from '../utils';
import { UserApi } from '../user';

import { IContext, ContextInstance, ContextDetailed } from './context.model';

export class Context {
  private database: IDatabase = database;

  constructor() {}

  public async create(context: IContext): Promise<ContextInstance> {
    return await this.database.context.create(context).catch(error => {
      if (error.name === 'SequelizeUniqueConstraintError') {
        const message = 'URI must be unique.';
        throw Boom.conflict(message);
      } else {
        throw Boom.badImplementation(error);
      }
    });
  }

  public async update(id: string, context: IContext): Promise<{ id: string }> {
    return await this.database.context
      .update(context, {
        where: {
          id: id
        }
      })
      .then((count: [number, ContextInstance[]]) => {
        if (!count[0]) {
          throw Boom.notFound();
        }
        return { id: id };
      })
      .catch(error => {
        if (Boom.isBoom(error)) {
          throw Boom;
        }
        if (error.name === 'SequelizeUniqueConstraintError') {
          const message = 'URI must be unique.';
          throw Boom.conflict(message);
        } else {
          throw Boom.badImplementation(error);
        }
      });
  }

  public async delete(id: string): Promise<void> {
    return await this.database.context
      .destroy({
        where: {
          id: id
        }
      })
      .then((count: number) => {
        if (!count) {
          throw Boom.notFound();
        }
        return;
      });
  }

  public async get(): Promise<ContextInstance[]> {
    return await this.database.context
      .findAll()
      .then((contexts: ContextInstance[]) => {
        const plainContexts = contexts.map(context =>
          ObjectUtils.removeNull(context.get())
        );
        return plainContexts;
      });
  }

  public async getById(
    id: string,
    user: string,
    includeLayers = false,
    includeTools = false
  ): Promise<ContextDetailed> {
    const include = [];
    if (includeLayers) {
      include.push(this.database.layer);
    }
    if (includeTools) {
      include.push(this.database.tool);
    }

    let where: any = { id: id };

    if (isNaN(<number>(<any>id))) {
      where = { uri: id };
    }

    const context = await this.database.context.findOne({
      include: include,
      where: where
    });

    if (!context) {
      throw Boom.notFound();
    }

    let globalTools;
    if (includeTools) {
      globalTools = await this.database.tool.findAll({
        where: { global: true }
      });
    }

    if (includeLayers || includeTools) {
      return await this.contextObjToPlainObj(context, user, globalTools);
    } else {
      return ObjectUtils.removeNull(context.get());
    }
  }

  private async contextObjToPlainObj(context, user, globalTools?):
    Promise<ContextDetailed> {

    let plain: any = context.get();
    plain.layers = [];
    plain.tools = [];
    plain.toolbar = [];

    for (const tool of context.tools) {
      const plainTool = tool.get();

      plainTool.options = Object.assign(
        {},
        plainTool.options,
        plainTool.toolContext.options
      );
      plainTool.toolContext = null;

      plain.tools.push(plainTool);
      if (plainTool.inToolbar) {
        plain.toolbar.push(plainTool.name);
      }
    }

    for (const tool of globalTools) {
      const plainTool = tool.get();
      if (plain.tools.findIndex(t => t.name === plainTool.name) === -1) {
        plain.tools.push(plainTool);
        if (plainTool.inToolbar) {
          plain.toolbar.push(plainTool.name);
        }
      }
    }

    plain.toolbar = plain.toolbar.sort((t1, t2) => t1 - t2);

    if (!context.layers || !context.layers.length) {
      return ObjectUtils.removeNull(plain);
    }

    const profils: string[] = await UserApi.getProfils(user).catch(() => {
      return [];
    });
    profils.push(user);
    const promises = [];
    const plainLayers = [];
    for (const layer of context.layers) {
      const plainL = layer.get();
      plainLayers.push(plainL);
      promises.push(
        UserApi.verifyPermissionByUrl(plainL.sourceOptions.url, profils)
      );
    }

    const promisesResult = await Promise.all(promises);
    let i = 0;
    for (const plainLayer of plainLayers) {
      if (promisesResult[i]) {
        plainLayer.sourceOptions = Object.assign(
          {},
          plainLayer.sourceOptions,
          plainLayer.layerContext.sourceOptions
        );
        Object.assign(
          plainLayer,
          plainLayer.layerOptions,
          plainLayer.layerContext.layerOptions
        );

        plainLayer.layerContext = null;
        plainLayer.layerOptions = null;
        plain.layers.push(plainLayer);
      }
      i++;
    }

    plain = ObjectUtils.removeNull(plain);
    plain.layers = plain.layers.sort(
      (a, b) =>
        a.zIndex < b.zIndex
          ? -1
          : a.zIndex > b.zIndex
            ? 1
            : 0
    );

    return ObjectUtils.removeNull(plain);
  }
}
