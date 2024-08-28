import * as Boom from '@hapi/boom';

import { ObjectUtils } from '@igo2/base-api';
import { UserApi } from '../user';
import { ILayer, Layer, LayerOptions, SourceOptions } from '../layer';
import { ITool, Tool } from '../tool';

import { ContextDetailedOut, ContextDetailed, IContext } from './context.interface';
import { Context } from './context.model';
import { ILayerContext } from '../layerContext';
import { LayerWss } from '../layer/layer-wss';
import { Request } from '@hapi/hapi';

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

  public async getById(id: string): Promise<ContextDetailedOut> {
    let where: any = { id: id };

    if (isNaN(id as any)) {
      where = { uri: id };
    }

    const context = await Context.findOne({
      where: where
    });

    if (!context) {
      throw Boom.notFound();
    }

    return ObjectUtils.removeNull(context.get());
  }

  public async getDetailedById(id: string, user: string, request: Request): Promise<ContextDetailedOut> {
    let where: any = { id: id };

    if (isNaN(id as any)) {
      where = { uri: id };
    }

    const context = await Context.findOne({
      include: [Layer, Tool],
      where: where
    });

    if (!context) {
      throw Boom.notFound();
    }

    const globalTools: Tool[] = await Tool.findAll({
      where: { global: true }
    });

    const globalLayers: Layer[] = await Layer.findAll({
      where: { global: true }
    });

    const profils: string[] = await UserApi.getProfils(user).catch(() => {
      return [];
    });
    profils.push(user);

    const [toolbar, tools] = this.formatTools(context, profils, globalTools);

    const layers = await this.formatLayers(context.layers, profils, globalLayers, request);

    const contextDetailed: ContextDetailedOut = {
      ...context.get(),
      layers,
      tools,
      toolbar
    };
    return ObjectUtils.removeNull(contextDetailed);
  }

  private formatTools(context: Context, profils: string[], globalTools?: Tool[]): [string[], ITool[]] {
    const toolbar: ITool[] = [];
    const tools: ITool[] = [];

    const toolsFiltered = context.tools.filter((t) => {
      return t.profils.length === 0 || t.profils.some((p) => profils.includes(p));
    });

    for (const tool of toolsFiltered) {
      const plainTool = tool.get();

      plainTool.options = Object.assign({}, plainTool.options, (plainTool as any).ToolContext.options);
      (plainTool as any).ToolContext = null;
      delete plainTool.profils;

      tools.push(plainTool);
      if (plainTool.inToolbar) {
        toolbar.push(plainTool);
      }
    }

    for (const tool of globalTools.filter((t) => {
      return t.profils.length === 0 || t.profils.some((p) => profils.includes(p));
    })) {
      const plainTool = tool.get();
      delete plainTool.profils;
      if (tools.findIndex((t) => t.name === plainTool.name) === -1) {
        tools.push(plainTool);
        if (plainTool.inToolbar) {
          toolbar.push(plainTool);
        }
      }
    }

    const toolbarName = toolbar.sort((t1, t2) => t1.order - t2.order).map((t) => t.name);
    return [toolbarName, tools];
  }

  private async formatLayers(
    layers: Layer[],
    profils: string[],
    globalLayers: Layer[],
    request: Request
  ): Promise<LayerOptions[]> {
    const layersOptions: LayerOptions[] = [];

    const permissions: Promise<boolean>[] = [];
    const plainLayers: ILayer[] = [];

    for (const layer of layers) {
      const plainL = layer.get();
      plainLayers.push(plainL);
      permissions.push(UserApi.verifyPermissionByUrl(plainL.sourceOptions?.url, profils));
    }

    for (const globalLayer of globalLayers) {
      const plainL = globalLayer.get();
      if (plainLayers.findIndex((l) => l.id === plainL.id) === -1) {
        (plainL as any).LayerContext = {};
        plainLayers.push(plainL);
        permissions.push(UserApi.verifyPermissionByUrl(plainL.sourceOptions?.url, profils));
      }
    }

    const permissionsResult = await Promise.all(permissions);

    let i = 0;
    for (const plainLayer of plainLayers) {
      if (permissionsResult[i]) {
        if (!plainLayer.global && plainLayer.type === 'wms') {
          await LayerWss.setWssOptions(plainLayer, request);
        }

        const layerMerged = this.mergeLayer(plainLayer, (plainLayer as any).LayerContext);

        layersOptions.push(layerMerged);
      }
      i++;
    }

    return layersOptions.sort((a, b) => (a.zIndex < b.zIndex ? -1 : a.zIndex > b.zIndex ? 1 : 0));
  }

  private mergeLayer(layer: ILayer, layerContext: ILayerContext): LayerOptions {
    const params = {
      layers: layer.layers,
      ...(layer.sourceOptions?.params ?? {}),
      ...(layerContext.sourceOptions?.params ?? {})
    };

    const sourceOptions: SourceOptions = {
      type: layer.type,
      url: layer.url,
      optionsFromCapabilities: true,
      ...(layer.sourceOptions ?? {}),
      ...(layerContext.sourceOptions ?? {}),
      params
    };

    return {
      id: layer.id,
      ...layer.layerOptions,
      ...(layer as any).LayerContext.layerOptions,
      sourceOptions
    };
  }
}
