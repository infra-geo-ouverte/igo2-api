import { DrizzleQueryError } from 'drizzle-orm';

import { AppInstance, AppReply, AppRequest } from '../../app.interface';
import { ContextService } from '../context.service';
import {
  GetContextAllHiddenSchema,
  GetContextHiddenSchema,
  GetContextHideSchema,
  GetContextShowSchema
} from './context-hidden.schema';
import { ContextHiddenService } from './index';

export class ContextHiddenController {
  private contextService: ContextService;
  private contextHiddenService: ContextHiddenService;

  constructor(app: AppInstance) {
    this.contextService = new ContextService(app);
    this.contextHiddenService = new ContextHiddenService(app);
  }

  show = async (
    request: AppRequest<typeof GetContextShowSchema>,
    reply: AppReply<typeof GetContextShowSchema>
  ) => {
    const user = request.user;
    if (!user) {
      return reply.forbidden('Accès refusé');
    }

    const contextId = request.params.contextId;
    const context = await this.contextService.getById(contextId);
    if (!context) {
      return reply.notFound();
    }

    await this.contextHiddenService.show(user.id, contextId);

    return this.contextHiddenService.getById(user.id, contextId);
  };

  hide = async (
    request: AppRequest<typeof GetContextHideSchema>,
    reply: AppReply<typeof GetContextHideSchema>
  ) => {
    const user = request.user;
    if (!user) {
      return reply.forbidden('Accès refusé');
    }

    const contextId = request.params.contextId;
    const context = await this.contextService.getById(contextId);
    if (!context) {
      return reply.notFound();
    }
    try {
      const hidden = await this.contextHiddenService.hide(user.id, contextId);
      return reply.code(200).send(hidden);
    } catch (error) {
      if (error instanceof DrizzleQueryError) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const code = (error?.cause as any)?.code;
        if (code === '23505') {
          return reply.conflict('Context already hidden');
        }
      }

      throw error;
    }
  };

  get = async (
    request: AppRequest<typeof GetContextAllHiddenSchema>,
    reply: AppReply<typeof GetContextAllHiddenSchema>
  ) => {
    const user = request.user;
    if (!user) {
      return reply.forbidden('Accès refusé');
    }

    const contextId = request.params.contextId;
    const context = await this.contextService.getById(contextId);
    if (!context) {
      return reply.notFound();
    }

    return this.contextHiddenService.get(user.id);
  };

  getById = async (
    request: AppRequest<typeof GetContextHiddenSchema>,
    reply: AppReply<typeof GetContextHiddenSchema>
  ) => {
    const user = request.user;
    if (!user) {
      return reply.forbidden('Accès refusé');
    }

    const contextId = request.params.contextId;
    const context = await this.contextService.getById(contextId);
    if (!context) {
      return reply.notFound();
    }

    return this.contextHiddenService.getById(user.id, contextId);
  };
}
