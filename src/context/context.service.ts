import * as Boom from '@hapi/boom';
import { Request } from '@hapi/hapi';
import { Transaction } from 'sequelize';

import { ObjectUtils, uuid } from '@igo2/base-api';
import { UserApi } from '../user';
import { Layer, AnyLayerOptionsOut } from '../layer';
import { ITool, Tool } from '../tool';

import {
  ContextDetailedDto,
  ContextDetailed,
  IContext,
  IContextOut,
  Scope,
  ContextDetailedIn
} from './context.interface';
import { Context } from './context.model';
import { ILayerWithContext, LayerContext } from '../layerContext';
import { isLayerItemOptions, sortLayersByZindex, validateLayerPermissions } from '../layer/layer.utils';
import { LayerWss } from '../layer/layer-wss';
import { LayerTree } from '../layer/layer-tree';

import { LayerEntity } from '../layer/layer';

export class ContextService {
  public async create(context: ContextDetailedIn, transaction?: Transaction): Promise<Context> {
    return await Context.create(context, { transaction }).catch((error) => {
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

  public async clone(id: string, extraProperties: Partial<IContext>, transaction: Transaction): Promise<Context> {
    const { id: _id, ...context } = await this.getById(id);
    return this.create(
      {
        ...context,
        ...extraProperties,
        scope: Scope[Scope.private] as any,
        uri: uuid()
      },
      transaction
    );
  }

  public async update(id: string, context: ContextDetailedIn): Promise<{ id: string }> {
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

  public async getById(id: string): Promise<ContextDetailedDto> {
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

    return ObjectUtils.removeNull(context.get()) as IContextOut;
  }

  public async getDetailedById(id: number, user: string, request: Request): Promise<ContextDetailedDto> {
    let where: any = { id: id };

    if (isNaN(id as any)) {
      where = { uri: id };
    }

    const context = await Context.findOne({
      include: [
        Layer,
        // Get system layers
        LayerContext,
        Tool
      ],
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

    const layers = await this.formatLayers(context.get({ plain: true }), profils, globalLayers, request);

    const { layersSystem, ...restContextDetailed } = context.get({ plain: true }) as ContextDetailed;
    return ObjectUtils.removeNull({
      ...restContextDetailed,
      id: restContextDetailed.id!,
      layers: sortLayersByZindex(layers),
      tools,
      toolbar
    });
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

    const toolbarName = toolbar.sort((t1, t2) => (t1.order ?? 0) - (t2.order ?? 0)).map((t) => t.name);
    return [toolbarName, tools];
  }

  private async formatLayers(
    { layers = [], layersSystem = [] }: ContextDetailed,
    profils: string[],
    globalLayers: Layer[],
    request: Request
  ): Promise<AnyLayerOptionsOut[]> {
    const allLayers: ILayerWithContext[] = [
      ...layers,
      ...layersSystem.map((layerContext) => ({
        id: layerContext.id!,
        type: layerContext.layerOptions?.type!,
        layerOptions: layerContext.layerOptions
      }))
    ];

    for (const globalLayer of globalLayers) {
      const layer = globalLayer.get();
      const absent = allLayers.findIndex((l) => l.id === layer.id) === -1;
      if (absent) {
        allLayers.push(layer);
      }
    }

    const allLayerOptions: AnyLayerOptionsOut[] = [];
    for (const plainLayer of allLayers) {
      const { LayerContext = undefined, ...restLayer } = plainLayer;
      const layer = new LayerEntity(restLayer);
      layer.mergeLayerContext(LayerContext);

      const hasPermission = await validateLayerPermissions(layer.options, profils);
      if (!hasPermission) {
        continue;
      }

      if (!plainLayer.global && isLayerItemOptions(layer.options) && layer.options.sourceOptions?.type === 'wms') {
        layer.options = (await LayerWss.setWssOptions(layer.options, request)) as AnyLayerOptionsOut;
      }

      allLayerOptions.push(layer.options);
    }

    const tree = new LayerTree<AnyLayerOptionsOut>().fromFlatList(allLayerOptions);
    return tree.data;
  }
}
