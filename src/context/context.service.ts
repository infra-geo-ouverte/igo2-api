import { uuid } from '@igo2/base-api';
import { DrizzleQueryError, and, desc, eq, inArray, ne, or } from 'drizzle-orm';

import { AppDatabase, AppInstance } from '../app.interface';
import { IProfils } from '../auth';
import { Transaction } from '../core/database';
import { LayerService } from '../layer';
import { sortLayersByZindex } from '../layer/utils/layer.utils';
import { profilModel } from '../profil';
import { IUserWithProfils } from '../user';
import {
  IContext,
  IContextDetailed,
  IContextDetailedChanges,
  IContextDetailedIn,
  IContextDetailedUpdate,
  IContextIn,
  IContextOut,
  IContextWithRelations,
  IGetAllDetailledContext
} from './context.interface';
import { contextModel } from './context.model';
import { IContextHidden } from './hidden';
import { contextHiddenModel } from './hidden/context-hidden.model';
import { ContextLayerService } from './layer';
import { ContextPermissionService, contextPermissionModel } from './permission';
import { IContextPermission } from './permission/context-permission.interface';
import { ContextToolService } from './tool';

export class ContextService {
  private contextLayerService: ContextLayerService;
  private contextToolService: ContextToolService;
  private contextPermission: ContextPermissionService;
  private layerService: LayerService;
  private db: AppDatabase;

  constructor(private app: AppInstance) {
    this.contextLayerService = new ContextLayerService(app);
    this.contextToolService = new ContextToolService(app);
    this.contextPermission = new ContextPermissionService(app);
    this.layerService = new LayerService(app);
    this.db = app.db;
  }

  async createDetailed(
    context: IContextDetailedIn,
    user: IUserWithProfils
  ): Promise<IContextDetailed> {
    const contextDb = await this.db.transaction(async (tx) => {
      const contextDb = await this.create(
        {
          ...context,
          userId: user.id
        },
        tx
      );

      if (context.tools?.length) {
        await this.contextToolService.bulkCreate(
          contextDb.id,
          context.tools,
          tx
        );
      }
      if (context.layers?.length) {
        await this.contextLayerService.bulkCreate(
          contextDb.id,
          context.layers,
          tx
        );
      }

      return contextDb;
    });

    const contextDetailled = await this.getDetailedById(contextDb.id, user);
    return contextDetailled!;
  }

  private async create(
    context: IContextIn,
    transaction?: Transaction
  ): Promise<IContext> {
    const dbInstance = transaction ?? this.db;
    const [contextDb] = await dbInstance
      .insert(contextModel)
      .values(context)
      .returning();
    return contextDb;
  }

  async cloneDetailed(
    id: number,
    extraProperties: Partial<IContextDetailedIn>,
    user: IUserWithProfils
  ): Promise<IContext> {
    return this.db.transaction(async (tx) => {
      const contextDb = await this.clone(
        id,
        { ...extraProperties, userId: user.id },
        tx
      );
      if (!contextDb) {
        throw this.app.httpErrors.notFound('Context not found');
      }
      await this.contextLayerService.cloneByContextId(id, contextDb.id, tx);
      await this.contextToolService.cloneByContextId(id, contextDb.id, tx);

      return contextDb;
    });
  }

  private async clone(
    id: number,
    extraProperties: Partial<IContextIn>,
    transaction: Transaction
  ): Promise<IContext | undefined> {
    const context = await this.getById(id);
    if (!context) {
      return undefined;
    }

    const { id: _id, updatedAt, ...restContext } = context;
    return this.create(
      {
        ...restContext,
        ...extraProperties,
        scope: 'private',
        uri: uuid()
      },
      transaction
    );
  }

  async updateDetailed(
    id: number,
    context: IContextDetailedUpdate
  ): Promise<Partial<IContextDetailedChanges>> {
    const { layers, tools, ...restContext } = context;

    return this.db.transaction(async (tx) => {
      try {
        await this.update(id, restContext, tx);
      } catch (error) {
        if (error instanceof DrizzleQueryError) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const code = (error?.cause as any)?.code;
          if (code === '23505') {
            const message = 'URI must be unique.';
            throw this.app.httpErrors.conflict(message);
          }
        }

        throw error;
      }

      if (tools) {
        await this.contextToolService.deleteByContextId(id, tx);
        await this.contextToolService.bulkCreate(id, tools, tx);
      }

      const changes = await (layers
        ? this.contextLayerService.modify(id, layers, tx)
        : undefined);
      return {
        id,
        layers: changes
      };
    });
  }

  private async update(
    id: number,
    context: Partial<IContext>,
    transaction: Transaction
  ): Promise<void> {
    const dbInstance = transaction ?? this.db;
    await dbInstance
      .update(contextModel)
      .set(context)
      .where(eq(contextModel.id, id));
  }

  async delete(id: number): Promise<number> {
    const result = await this.db
      .delete(contextModel)
      .where(eq(contextModel.id, id));
    return result.rowCount ?? 0;
  }

  async get(): Promise<IContext[]> {
    return this.db.select().from(contextModel);
  }

  async getAllByCatetogies(
    profils: IProfils,
    userId: number,
    showHidden: boolean,
    permission?: string | string[]
  ): Promise<IGetAllDetailledContext> {
    const permissions = this.parsePermissions(permission);
    const profilsAuthorized = this.getAuthorizedProfils(profils, permissions);

    const hasPublic = profilsAuthorized.includes('public');

    const [ours, shared, public$] = await Promise.all([
      this.getOwnedContexts(userId, showHidden),
      this.getSharedContexts(userId, profilsAuthorized, showHidden),
      hasPublic ? this.getPublicContexts(userId, showHidden) : []
    ]);

    return {
      ours: ours,
      shared: shared,
      public: public$
    };
  }

  private parsePermissions(
    perm: string | string[] | undefined
  ): string[] | undefined {
    if (typeof perm === 'string') return perm.split(',').map((p) => p.trim());
    return perm;
  }

  private getAuthorizedProfils(
    profils: IProfils,
    permissions?: string[]
  ): IProfils {
    if (!permissions) {
      return profils;
    }
    return profils.filter((p) => permissions.includes(p.toString()));
  }

  private formatContext(
    context: IContextWithRelations,
    defaultPerm: 'read' | 'write' = 'read'
  ): IContextOut {
    const { contextHiddens, contextPermissions, ...restContext } = context;

    let permission = defaultPerm;
    if (contextPermissions?.some((cp) => cp.typePermission === 'write')) {
      permission = 'write';
    }

    return {
      ...restContext,
      permission,
      hidden: !!contextHiddens?.length
    };
  }

  private isVisible(
    context: IContextWithRelations,
    showHidden?: boolean
  ): boolean {
    return showHidden || !context.contextHiddens?.length;
  }

  private isPubliclyAccessible(context: IContextWithRelations): boolean {
    return (
      (context.contextPermissions && context.contextPermissions.length > 0) ||
      context.userId === null
    );
  }

  private async getOwnedContexts(
    userId: number,
    showHidden?: boolean
  ): Promise<IContextOut[]> {
    const contexts = await this.db.query.context.findMany({
      where: {
        userId
      },
      with: {
        contextHiddens: {
          where: { userId }
        },
        contextPermissions: true,
        contextTools: {
          with: {
            tool: true
          }
        },
        contextLayers: {
          with: {
            layer: true
          }
        }
      },
      orderBy: (context, { desc }) => [desc(context.createdAt)]
    });

    return contexts
      .filter((context) => this.isVisible(context, showHidden))
      .map((context) => this.formatContext(context, 'write'));
  }

  private async getSharedContexts(
    userId: number,
    profils: IProfils,
    showHidden?: boolean
  ): Promise<IContextOut[]> {
    const rows = await this.db
      .select({
        context: contextModel,
        permission: contextPermissionModel,
        hidden: contextHiddenModel
      })
      .from(contextModel)
      .leftJoin(
        contextPermissionModel,
        eq(contextModel.id, contextPermissionModel.contextId)
      )
      .leftJoin(
        profilModel,
        eq(contextPermissionModel.profilId, profilModel.id)
      )
      .leftJoin(
        contextHiddenModel,
        and(
          eq(contextModel.id, contextHiddenModel.contextId),
          eq(contextHiddenModel.userId, userId)
        )
      )
      .where(
        and(
          eq(contextModel.scope, 'protected'),
          ne(contextModel.userId, userId),
          or(
            eq(contextPermissionModel.userId, userId),
            inArray(profilModel.name, profils as string[])
          )
        )
      )
      .orderBy(desc(contextModel.createdAt));

    return this.reassembleContexts(rows)
      .filter((context) => this.isVisible(context, showHidden))
      .map((context) => this.formatContext(context));
  }

  private reassembleContexts(
    rows: {
      context: IContext;
      permission: IContextPermission | null;
      hidden: IContextHidden | null;
    }[]
  ): IContextWithRelations[] {
    const contextMap = new Map<number, IContextWithRelations>();

    for (const row of rows) {
      let context = contextMap.get(row.context.id);
      if (!context) {
        context = {
          ...row.context,
          contextPermissions: [],
          contextHiddens: [],
          contextLayers: [],
          contextTools: []
        } as unknown as IContextWithRelations;
        contextMap.set(row.context.id, context);
      }
      if (
        row.permission &&
        !context.contextPermissions!.some((p) => p.id === row.permission!.id)
      ) {
        context.contextPermissions!.push(row.permission);
      }
      if (
        row.hidden &&
        !context.contextHiddens!.some((h) => h.id === row.hidden!.id)
      ) {
        context.contextHiddens!.push(row.hidden);
      }
    }

    return Array.from(contextMap.values());
  }

  private async getPublicContexts(
    userId: number,
    showHidden?: boolean
  ): Promise<IContextOut[]> {
    const contexts = await this.db.query.context.findMany({
      where: {
        scope: 'public',
        userId: {
          isNull: true
        }
      },
      with: {
        contextPermissions: {
          with: {
            profil: true
          }
        },
        contextHiddens: {
          where: { userId }
        }
      },
      orderBy: (context, { desc }) => [desc(context.createdAt)]
    });

    return contexts
      .filter(
        (context) =>
          this.isVisible(context, showHidden) &&
          this.isPubliclyAccessible(context)
      )
      .map((context) => this.formatContext(context));
  }

  async getById(uri: string): Promise<IContext | undefined>;
  async getById(id: number): Promise<IContext | undefined>;
  async getById(value: number | string): Promise<IContext | undefined> {
    const where = typeof value === 'string' ? { uri: value } : { id: value };

    return this.db.query.context.findFirst({
      where
    });
  }

  async getByUri(uri: string): Promise<IContext | undefined> {
    return this.getById(uri);
  }

  async getDetailedById(
    id: number | string,
    user: IUserWithProfils | undefined
  ): Promise<IContextDetailed | undefined> {
    const value =
      typeof id === 'string' && !isNaN(Number(id)) ? Number(id) : id;
    const where = typeof value === 'string' ? { uri: value } : { id: value };

    const context = await this.db.query.context.findFirst({
      where,
      with: {
        contextLayers: {
          with: {
            layer: true
          }
        },
        contextTools: {
          with: {
            tool: true
          }
        }
      }
    });

    if (!context) {
      return;
    }

    const globalTools = await this.db.query.tool.findMany({
      where: { global: true }
    });

    const globalLayers = await this.layerService.getAllGlobal();

    const profils = user?.profils ?? [];
    const [toolbar, tools] = this.contextToolService.formatTools(
      context.contextTools,
      profils,
      globalTools
    );

    const layers = await this.contextLayerService.formatLayersToOptions(
      context.contextLayers,
      profils,
      globalLayers
    );

    const permission = await this.contextPermission.getTypePermission(
      context,
      user
    );

    const {
      contextLayers: _cl,
      contextTools: _ct,
      ...restContextDetailed
    } = context;

    return {
      ...restContextDetailed,
      layers: sortLayersByZindex(layers),
      tools,
      toolbar,
      permission
    };
  }
}
