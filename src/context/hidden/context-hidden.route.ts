import { AppInstance } from '../../app.interface';
import { addRoutingTagHook } from '../../utils/url.utils';
import { CONTEXT_TAG } from '../context.route';
import { ContextHiddenController } from './context-hidden.controller';
import {
  GetContextHiddenSchema,
  GetContextHideSchema,
  GetContextShowSchema
} from './context-hidden.schema';

export const routes = (app: AppInstance) => {
  const controller = new ContextHiddenController(app);

  const tags = [`${CONTEXT_TAG}/Hidden`];
  addRoutingTagHook(app, tags, [CONTEXT_TAG]);

  app.route({
    method: 'GET',
    url: '/hidden',
    handler: controller.getById,
    schema: GetContextHiddenSchema
  });

  app.route({
    method: 'POST',
    url: '/show',
    handler: controller.show,
    schema: GetContextShowSchema
  });

  app.route({
    method: 'POST',
    url: '/hide',
    handler: controller.hide,
    schema: GetContextHideSchema
  });
};
