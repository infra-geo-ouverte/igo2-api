import * as Boom from '@hapi/boom';

import { ObjectUtils } from '@igo2/base-api';
import { UserApi } from '../user';
import { ILayer, Layer, LayerOptions, SourceOptions } from '../layer';
import { Tool } from '../tool';

import { ContextDetailedOut, ContextDetailed, IContext } from './context.interface';
import { Context } from './context.model';

export class ContextService {
  public async create(context: ContextDetailed): Promise<Context> {
    return await Context.create(context).catch((error) => {
      if (error?.data?.name === 'SequelizeUniqueConstraintError') {
        const message = 'URI must be unique.';
        throw Boom.conflict(message);
      }
      if (Boom.isBoom(error)) {
        throw error;
      }
      throw Boom.badImplementation(error);
    });
  }

  public async update(id: string, context: ContextDetailed): Promise<{ id: string }> {
    return await Context.update(context, {
      where: {
        id: id
      }
    })
      .then((count: [number]) => {
        if (!count[0]) {
          throw Boom.notFound();
        }
        return { id: id };
      })
      .catch((error) => {
        if (error?.data?.name === 'SequelizeUniqueConstraintError') {
          const message = 'URI must be unique.';
          throw Boom.conflict(message);
        }
        if (Boom.isBoom(error)) {
          throw error;
        }
        throw Boom.badImplementation(error);
      });
  }

  public async delete(id: string): Promise<void> {
    return await Context.destroy({
      where: {
        id: id
      }
    }).then((count: number) => {
      if (!count) {
        throw Boom.notFound();
      }
      return;
    });
  }

  public async get(): Promise<IContext[]> {
    return Context.findAll().then((contexts: Context[]) => {
      const plainContexts = contexts.map((context) => ObjectUtils.removeNull(context.get()));
      return plainContexts;
    });
  }

  public async getById(
    id: string,
    user: string,
    includeLayers = false,
    includeTools = false
  ): Promise<ContextDetailedOut> {
    const include = [];
    if (includeLayers) {
      include.push(Layer);
    }
    if (includeTools) {
      include.push(Tool);
    }

    let where: any = { id: id };

    if (isNaN(id as any)) {
      where = { uri: id };
    }

    const context = await Context.findOne({
      include: include,
      where: where
    });

    if (!context) {
      throw Boom.notFound();
    }

    let globalTools: Tool[];
    if (includeTools) {
      globalTools = await Tool.findAll({
        where: { global: true }
      });
    }

    let globalLayers: Layer[];
    if (includeLayers) {
      globalLayers = await Layer.findAll({
        where: { global: true }
      });
    }

    if (includeLayers || includeTools) {
      return await this.contextObjToPlainObj(context, user, globalTools, globalLayers);
    } else {
      return ObjectUtils.removeNull(context.get());
    }
  }

  private async contextObjToPlainObj(
    context: Context,
    user: string,
    globalTools?: Tool[],
    globalLayers?: Layer[]
  ): Promise<ContextDetailedOut> {
    const profils: string[] = await UserApi.getProfils(user).catch(() => {
      return [];
    });
    profils.push(user);

    const contextDetailed: ContextDetailedOut = {
      ...context.get(),
      layers: [],
      tools: [],
      toolbar: []
    };

    const toolbar = [];

    const toolsFiltered = context.tools.filter((t) => {
      return t.profils.length === 0 || t.profils.some((p) => profils.includes(p));
    });

    for (const tool of toolsFiltered) {
      const plainTool = tool.get();

      plainTool.options = Object.assign({}, plainTool.options, (plainTool as any).ToolContext.options);
      (plainTool as any).ToolContext = null;
      delete plainTool.profils;

      contextDetailed.tools.push(plainTool);
      if (plainTool.inToolbar) {
        toolbar.push(plainTool);
      }
    }

    for (const tool of globalTools.filter((t) => {
      return t.profils.length === 0 || t.profils.some((p) => profils.includes(p));
    })) {
      const plainTool = tool.get();
      delete plainTool.profils;
      if (contextDetailed.tools.findIndex((t) => t.name === plainTool.name) === -1) {
        contextDetailed.tools.push(plainTool);
        if (plainTool.inToolbar) {
          toolbar.push(plainTool);
        }
      }
    }

    contextDetailed.toolbar = toolbar.sort((t1, t2) => t1.order - t2.order).map((t) => t.name);

    if ((!context.layers || !context.layers.length) && !globalLayers) {
      return ObjectUtils.removeNull(contextDetailed);
    }

    const promises = [];
    const plainLayers: ILayer[] = [];

    for (const layer of context.layers) {
      const plainL = layer.get();
      plainLayers.push(plainL);
      promises.push(UserApi.verifyPermissionByUrl(plainL.sourceOptions?.url, profils));
    }

    for (const globalLayer of globalLayers) {
      const plainL = globalLayer.get();
      if (plainLayers.findIndex((l) => l.id === plainL.id) === -1) {
        (plainL as any).LayerContext = {};
        plainLayers.push(plainL);
        promises.push(UserApi.verifyPermissionByUrl(plainL.sourceOptions?.url, profils));
      }
    }

    const promisesResult = await Promise.all(promises);
    let i = 0;
    for (const plainLayer of plainLayers) {
      if (promisesResult[i]) {
        const params = Object.assign(
          {
            layers: plainLayer.layers
          },
          (plainLayer.sourceOptions || {}).params,
          ((plainLayer as any).LayerContext.sourceOptions || {}).params
        );

        const sourceOptions: SourceOptions = Object.assign(
          {
            type: plainLayer.type,
            url: plainLayer.url,
            optionsFromCapabilities: true
          },
          plainLayer.sourceOptions,
          (plainLayer as any).LayerContext.sourceOptions,
          {
            params
          }
        );

        const layerFormatted: LayerOptions = Object.assign(
          {
            id: plainLayer.id
          },
          plainLayer.layerOptions,
          (plainLayer as any).LayerContext.layerOptions,
          {
            sourceOptions
          }
        );

        contextDetailed.layers.push(layerFormatted);
      }
      i++;
    }

    contextDetailed.layers = contextDetailed.layers.sort((a, b) =>
      a.zIndex < b.zIndex ? -1 : a.zIndex > b.zIndex ? 1 : 0
    );

    return ObjectUtils.removeNull(contextDetailed);
  }
}
