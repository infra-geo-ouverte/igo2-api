---
name: Fastify and TypeBox Routing Patterns
description: Guidelines for defining routes, schemas, and controllers using Fastify and TypeBox in the project.
---

# Fastify and TypeBox Routing Patterns

This skill documents the conventions for building API endpoints with Fastify, using TypeBox for typed contracts and schema validation.

## Route Definitions

Routes are defined in `[domain].route.ts` files within each domain module. Use the `app.route()` method for full control and type safety.

- **Structure**: Group routes inside a function (e.g., `subRoutes`) that receives the `AppInstance`.
- **Method/URL**: Use standard HTTP methods (`GET`, `POST`, `PATCH`, `DELETE`).
- **Handlers**: Point to methods on a class-based controller.
- **Schemas**: Assign a `FastifySchema` defined in the module's `schema.ts`.

### Example Route

```typescript
app.route({
  method: 'POST',
  url: '/:id/action',
  preHandler: [authenticatedAuthorization],
  handler: controller.doAction,
  schema: MyActionSchema
});
```

## Middleware & Authorization

- **preHandler**: Use this array for middleware like authentication or project-specific permission checks (e.g., `hasContextReadPermission(app)`).
- **Tags**: Use `addRoutingTagHook` to organize Swagger/OpenAPI documentation consistently.

## Controller Patterns

Controllers should be class-based and local to the domain module.

- **Injection**: Receives `AppInstance` in the constructor to initialize services.
- **Method Typing**: Use `AppRequest<typeof MySchema>` and `AppReply<typeof MySchema>` to ensure the request body, params, and response are strictly checked against the TypeBox schema.

### Example Controller Method

```typescript
doAction = async (request: AppRequest<typeof MyActionSchema>, reply: AppReply<typeof MyActionSchema>) => {
  const result = await this.service.perform(request.body);
  return reply.code(200).send(result);
};
```

## Schema Integration

- **satisfies**: Always define schema objects using `satisfies FastifySchema`.
- **Reuse**: Spread common schemas (like `BASE_SCHEMA_CONTEXT`) to include shared parameters or headers.
