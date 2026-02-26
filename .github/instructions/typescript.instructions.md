---
applyTo: "**/*.ts
---

# TypeScript Development Guidelines

Follow these patterns for consistent, maintainable TypeScript code across the project.

## Core Intent

- Maintain strong type safety without sacrificing clarity.
- Single source of truth: derive types from models, not duplication.
- Favor explicit intent over clever abstractions.
- Prefix domain entities with `I` (e.g., `IUser`, `IContext`).

## Type Declarations

### interface vs type

- **interface**: Domain entities, contracts, object shapes that extend. Prefix with `I`: `interface IUser`, `interface IUserWithProfils`.
- **type**: Unions, intersections, aliases, utility type derivatives.

```typescript
export type IUser = typeof userModel.$inferSelect;
export type IUserIn = Omit<typeof userModel.$inferInsert, 'createdAt' | 'updatedAt'>;
export interface IUserWithProfils extends IUser { profils: IProfils; }
```

## Drizzle ORM Type Patterns

- Always use `typeof model.$inferSelect` and `typeof model.$inferInsert` instead of manually defining types.
- Use `Omit` to remove system fields (timestamps, IDs) for input types.
- Centralize all entity types in `[domain].interface.ts`.

```typescript
export type ILayer = typeof layerModel.$inferSelect;
export type ILayerIn = Omit<typeof layerModel.$inferInsert, 'createdAt' | 'updatedAt'>;
```

## Utility Types

- **Omit**: Remove specific fields (e.g., timestamps).
- **Partial**: Make properties optional for updates.
- **Pick**: Select only needed fields.
- **Required**: Enforce all properties mandatory.
- **Record**: Create indexed object types.

Use these for domain-specific type variants rather than duplicating shapes.

## Discriminated Unions & const Assertions

Use `as const` for enum-like values with exhaustive checking:

```typescript
export const LayerType = ['group', 'wms', 'wfs', 'vector', 'wmts'] as const;
export type LayerType = (typeof LayerType)[number];
```

In switch statements, TypeScript enforces all cases are handled.

## Generics & Type Parameters

- Use generics for reusable, type-safe abstractions (services, controllers).
- Provide explicit type constraints where needed: `<T extends object>`.
- Extend Fastify base types for domain-specific request/reply: `AppRequest<typeof Schema>`, `AppReply<typeof Schema>`.

```typescript
export type AppRequest<TSchema extends FastifySchema = FastifySchema> = 
  FastifyRequest & RequestSchema<TSchema>;
```

## TypeBox Schema Validation

- Define schemas in `[domain].schema.ts` using `createSelectSchema` and `createInsertSchema`.
- Use `satisfies FastifySchema` to validate schema objects without widening types.
- Always specify `Type.Object<Record<keyof IMyInterface, TSchema>>` to ensure schema matches interface.

```typescript
export const GetUserSchema = {
  params: Type.Object({ id: Type.Number() }),
  response: { 200: SelectUserSchema }
} satisfies FastifySchema;
```

## Type Guards & Narrowing

- Implement type guards to narrow `unknown` safely.
- Use discriminated unions with a `role` or `type` property for exhaustive patterns.

```typescript
function isLayerOptions(obj: unknown): obj is LayerOptions {
  return typeof obj === 'object' && obj !== null && 'sourceOptions' in obj;
}
```

## Module Organization & Exports

Each domain follows a consistent structure:
- `[domain].model.ts`: Drizzle table definition.
- `[domain].interface.ts`: All entity types (I-prefixed).
- `[domain].schema.ts`: TypeBox/Fastify schemas.
- `[domain].service.ts`: Business logic.
- `[domain].controller.ts`: HTTP orchestration.
- `index.ts`: Barrel export (public API).

```typescript
// src/user/index.ts
export * from './user.interface';
export * from './user.service';
export * from './user.controller';
```

## Class & Function Typing

- Always provide explicit return types on public methods.
- Use constructor dependency injection with typed parameters.
- Initialize all class properties with explicit types.

```typescript
export class UserService {
  constructor(private app: AppInstance) {}
  
  async getById(id: number): Promise<IUser | undefined> {
    return this.db.query.userModel.findFirst();
  }
}
```

## Intersection Types

Combine interfaces for composite types:

```typescript
export type IAppEnv = IConfig & IAppBaseEnv & ISentryEnv & IDatabaseEnv;
```

## Async & Promise Typing

- Always specify the resolved type: `async fn(): Promise<IUser>`.
- Use `try/catch` for error handling; avoid implicit error types.

```typescript
async fetchUser(id: number): Promise<IUser> {
  try {
    return await this.db.query.userModel.findFirst();
  } catch (error) {
    throw new AppError('User not found', 404);
  }
}
```

## Avoid Anti-Patterns

- **No `any`**: Use `unknown` + type guards instead.
- **No manual type duplication**: Derive from models with `$inferSelect`.
- **No implicit function returns**: Always specify return type.
- **No raw `Promise<any>`**: Always specify resolved type.

## Type Safety with Transactions

Pass transaction instances through nested calls and preserve types:

```typescript
async create(data: IContextIn, tx?: Transaction): Promise<IContext> {
  const db = tx ?? this.db;
  const [context] = await db.insert(contextModel).values(data).returning();
  return context;
}
```

## Extending Third-Party Types

Centralize type extensions in `app.interface.ts`:

```typescript
export type AppInstance = FastifyInstance & InstanceSchema;
export type AppDatabase = NodePgDatabase<typeof models, typeof relations>;
```

## Compiler Configuration

TypeScript strict mode is enforced:
- `strict: true` enables all checks.
- `noImplicitAny: true` requires explicit types.
- `strictNullChecks: true` distinguishes null/undefined.
- `forceConsistentCasingInFileNames: true`.

## Naming Conventions

- **Classes, interfaces**: PascalCase, interfaces prefixed with `I`.
- **Variables, functions**: camelCase.
- **Files**: `[domain].[layer].ts` (e.g., `user.model.ts`, `context.service.ts`).
- **Constants**: UPPER_SNAKE_CASE.

## Custom Utility Types

Store reusable utility types in `utils/typescript.ts`:

```typescript
export type DeepPartial<T> = T extends object 
  ? { [P in keyof T]?: DeepPartial<T[P]>; }
  : T;
```

## Testing

- Use `AppRequest<typeof Schema>` and `AppReply<typeof Schema>` for type-safe test assertions.
- Import and re-export types from barrel files (`index.ts`).

## Error Handling

Define typed error responses; return union of success/error types:

```typescript
export interface IErrorResponse {
  statusCode: number;
  error: string;
  message: string;
}

async function handle(): Promise<IUser | IErrorResponse> {
  // ...
}
```

## Import Order

1. External libraries.
2. Internal types/interfaces.
3. Services and utilities.
4. Domain-specific imports.

```typescript
import { FastifyInstance } from 'fastify';
import type { IUser } from './user.interface';
import { UserService } from './user.service';
```

## Further Resources

- [Drizzle ORM TypeBox integration](https://orm.drizzle.team/docs/typebox)
- [TypeBox documentation](https://github.com/sinclairzx81/typebox)
- [Fastify TypeScript support](https://docs.fastify.io/Guides/TypeScript)
