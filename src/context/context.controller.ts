import { AppInstance, AppReply, AppRequest } from '../app.interface';
import { UserService } from '../user';
import { ContextAccessService } from './access/context-access.service';
import {
  IContextDetailed,
  IContextDetailedChanges,
  IContextDetailedUpdate,
  IGetAllDetailledContext
} from './context.interface';
import {
  CloneContextSchema,
  CreateContextSchema,
  DeleteContextSchema,
  GetContextByIdSchema,
  GetContextDefaultSchema,
  GetContextDetailedByIdSchema,
  GetContextsSchema,
  PostContextDefaultSchema,
  UpdateContextSchema
} from './context.schema';
import { ContextService } from './context.service';

const DEFAULT_CONTEXT_URI = 'default';

export class ContextController {
  private contextService: ContextService;
  private contextAccessService: ContextAccessService;
  private userService: UserService;

  constructor(app: AppInstance) {
    this.contextService = new ContextService(app);
    this.userService = new UserService(app);
    this.contextAccessService = new ContextAccessService(app);
  }

  create = async (
    request: AppRequest<typeof CreateContextSchema>,
    reply: AppReply<typeof CreateContextSchema>
  ) => {
    const newContext = request.body as unknown as IContextDetailed;

    const contextUri = await this.contextService.getByUri(newContext.uri);
    if (contextUri) {
      const message = 'URI must be unique.';
      throw reply.conflict(message);
    }

    const user = request.user!;
    const context = await this.contextService.createDetailed(newContext, user);

    return reply.code(201).send(context);
  };

  cloneDetailed = async (
    request: AppRequest<typeof CloneContextSchema>,
    reply: AppReply<typeof CloneContextSchema>
  ) => {
    const id = request.params.contextId;

    const contextDb = await this.contextService.getById(id);
    if (!contextDb) {
      return reply.notFound('Context not found');
    }

    const user = request.user!;
    const context = await this.contextService.cloneDetailed(
      id,
      (request.body as Partial<IContextDetailed>) ?? {},
      user
    );

    const contextDetailed = await this.contextService.getDetailedById(
      context.id,
      request.user!
    );
    if (!contextDetailed) {
      throw reply.notFound(`No context found for ${context.id}`);
    }

    return reply.code(201).send(contextDetailed);
  };

  update = async (
    request: AppRequest<typeof UpdateContextSchema>,
    reply: AppReply<typeof UpdateContextSchema>
  ): Promise<Partial<IContextDetailedChanges>> => {
    const id = request.params.contextId;

    const context = await this.contextService.getById(id);
    if (!context) {
      return reply.notFound('Context not found');
    }

    return this.contextService.updateDetailed(
      id,
      request.body as IContextDetailedUpdate
    );
  };

  delete = async (
    request: AppRequest<typeof DeleteContextSchema>,
    reply: AppReply<typeof DeleteContextSchema>
  ) => {
    const id = request.params.contextId;

    const context = await this.contextService.getById(id);
    if (!context) {
      return reply.notFound('Context not found');
    }

    const result = await this.contextService.delete(id);
    return reply.code(204).send(result);
  };

  getById = async (
    request: AppRequest<typeof GetContextByIdSchema>,
    reply: AppReply<typeof GetContextByIdSchema>
  ) => {
    const id = request.params.contextId;

    const context = await this.contextService.getById(id);
    if (!context) {
      return reply.notFound('Context not found');
    }

    return context;
  };

  get = async (
    request: AppRequest<typeof GetContextsSchema>
  ): Promise<IGetAllDetailledContext> => {
    const user = request.user;
    const { hidden, permission } = request.query;

    if (!user) {
      return {
        ours: [],
        public: [],
        shared: []
      };
    }

    return this.contextService.getAllByCatetogies(
      user.profils,
      user.id,
      !!hidden,
      permission
    );
  };

  getDetailsById = async (
    request: AppRequest<typeof GetContextDetailedByIdSchema>,
    reply: AppReply<typeof GetContextDetailedByIdSchema>
  ) => {
    const id = request.params.contextId;

    const contextDetails = await this.contextService.getDetailedById(
      id,
      request.user
    );
    if (!contextDetails) {
      return reply.notFound('Context not found');
    }

    await this.contextAccessService.upsert(contextDetails.id);
    return contextDetails;
  };

  getDefault = async (
    request: AppRequest<typeof GetContextDefaultSchema>,
    reply: AppReply<typeof GetContextDefaultSchema>
  ) => {
    const user = request.user;
    if (!user) {
      return this.contextService.getByUri(DEFAULT_CONTEXT_URI);
    }

    let context = await (user.defaultContextId
      ? this.contextService.getById(user.defaultContextId)
      : this.contextService.getById(DEFAULT_CONTEXT_URI));
    if (!context) {
      context = await this.contextService.getByUri(DEFAULT_CONTEXT_URI);
      if (!context) {
        throw new Error("Le contexte système n'a pas été trouvé");
      }
      this.userService.update(user.id, {
        defaultContextId: context.id
      });
    }

    const newRequest = {
      ...request,
      params: {
        contextId: context.id
      }
    } as AppRequest<typeof GetContextDetailedByIdSchema>;

    return this.getDetailsById(
      newRequest,
      reply as unknown as AppReply<typeof GetContextDetailedByIdSchema>
    );
  };

  setDefaultContext = async (
    request: AppRequest<typeof PostContextDefaultSchema>,
    reply: AppReply<typeof PostContextDefaultSchema>
  ) => {
    const { defaultContextId } = request.body;

    const user = request.user!;
    if (user.defaultContextId === defaultContextId) {
      return reply.badRequest('Le contexte est déjà celui par défaut');
    }

    await this.userService.update(user.id, {
      defaultContextId
    });
    return defaultContextId;
  };
}
