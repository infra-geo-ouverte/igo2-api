import * as Boom from '@hapi/boom';

import { ObjectUtils } from '@igo2/base-api';
import { UserApi } from '../user';
import { Layer } from '../layer';
import { Tool } from '../tool';

import { IContext, ContextDetailed } from './context.interface';
import { Context } from './context.model';

export class ContextService {
  public async create (context: IContext): Promise<Context> {
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

  public async update (id: string, context: IContext): Promise<{ id: string }> {
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

  public async delete (id: string): Promise<void> {
    return await Context.destroy({
      where: {
        id: id
      }
    }).then((count: number) => {
      if (!count) {
        throw Boom.notFound();
      }
    });
  }

  public async get (): Promise<Context[]> {
    return await Context.findAll().then((contexts: Context[]) => {
      const plainContexts = contexts.map((context) => ObjectUtils.removeNull(context.get()));
      return plainContexts;
    });
  }

  public async getById (
    id: string,
    user: string,
    includeLayers = false,
    includeTools = false
  ): Promise<ContextDetailed> {
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

    let globalTools;
    if (includeTools) {
      globalTools = await Tool.findAll({
        where: { global: true }
      });
    }

    let globalLayers;
    if (includeLayers) {
      globalLayers = await Layer.findAll({
        where: { global: true, enabled: true }
      });
    }

    if (includeLayers || includeTools) {
      return await this.contextObjToPlainObj(context, user, globalTools, globalLayers);
    } else {
      return ObjectUtils.removeNull(context.get());
    }
  }

  private async contextObjToPlainObj (context, user, globalTools?, globalLayers?): Promise<ContextDetailed> {
    const profils: string[] = await UserApi.getProfils(user).catch(() => {
      return [];
    });
    profils.push(user);

    let plain: any = context.get();
    plain.layers = [];
    plain.tools = [];
    plain.toolbar = [];
    const toolbar = [];

    for (const tool of context.tools.filter(t => {
      return t.profils.length === 0 || t.profils.some(p => profils.includes(p));
    })) {
      const plainTool = tool.get();

      plainTool.options = Object.assign({}, plainTool.options, plainTool.ToolContext.options);
      plainTool.order = plainTool.ToolContext.order !== undefined ? plainTool.ToolContext.order : plainTool.order;
      plainTool.enabled = plainTool.ToolContext.enabled;
      plainTool.ToolContext = null;
      delete plainTool.profils;

      if (plainTool.enabled !== false) {
        plain.tools.push(plainTool);
        if (plainTool.inToolbar) {
          toolbar.push(plainTool);
        }
      }
    }

    for (const tool of globalTools.filter(t => {
      return t.profils.length === 0 || t.profils.some(p => profils.includes(p));
    })) {
      const plainTool = tool.get();
      delete plainTool.profils;
      if (plain.tools.findIndex((t) => t.name === plainTool.name) === -1) {
        plain.tools.push(plainTool);
        if (plainTool.inToolbar) {
          toolbar.push(plainTool);
        }
      }
    }

    plain.toolbar = toolbar
      .filter(t => t.order)
      .sort((t1, t2) => t1.order - t2.order).map((t) => t.name)
      .concat(toolbar.filter(t => !t.order).map((t) => t.name));

    if ((!context.layers || !context.layers.length) && !globalLayers) {
      return ObjectUtils.removeNull(plain);
    }

    const plainLayers = [];

    for (const layer of context.layers.filter(l => {
      return l.profils.length === 0 || l.profils.some(p => profils.includes(p));
    })) {
      const plainL = layer.get();
      if (plainL.LayerContext.enabled && plainL.enabled) {
        plainLayers.push(plainL);
      }
    }

    for (const layer of globalLayers.filter(l => {
      return l.profils.length === 0 || l.profils.some(p => profils.includes(p));
    })) {
      const plainL = layer.get();
      if (plainLayers.findIndex((l) => l.id === plainL.id) === -1) {
        plainL.LayerContext = {};
        plainLayers.push(plainL);
      }
    }

    for (const plainLayer of plainLayers) {
      const params = Object.assign(
        {
          layers: plainLayer.layers
        },
        (plainLayer.sourceOptions || {}).params,
        (plainLayer.LayerContext.sourceOptions || {}).params
      );

      const sourceOptions = Object.assign(
        {
          type: plainLayer.type,
          url: plainLayer.url,
          optionsFromCapabilities: true
        },
        plainLayer.sourceOptions,
        plainLayer.LayerContext.sourceOptions,
        {
          params
        }
      );

      const layerFormatted = Object.assign({}, plainLayer.layerOptions, plainLayer.LayerContext.layerOptions, {
        sourceOptions
      });

      plain.layers.push(layerFormatted);
    }

    plain = ObjectUtils.removeNull(plain);
    plain.layers = plain.layers.sort((a, b) => (a.zIndex < b.zIndex ? -1 : a.zIndex > b.zIndex ? 1 : 0));

    return ObjectUtils.removeNull(plain);
  }
}
