---
name: drizzle-patterns
description: Guidelines for defining Drizzle models, schemas, and migrations in the project.
---

# Drizzle ORM and TypeBox Patterns

This skill provides the standard patterns and conventions for database modeling and schema validation within the project.

## Overview

The project uses **Drizzle ORM** with **PostgreSQL** (`drizzle-orm/pg-core`) and **TypeBox** for runtime validation and static type generation.

## Model Definition Patterns

All models should follow these conventions:

- **Location**: Group models by domain (e.g., `src/context/permission/context-permission.model.ts`).
- **Base Table**: Use `appPgTable` from `../../core/database` instead of `pgTable` to ensure consistent base columns. Samething for `appPgEnum` instead of `pgEnum`
- **Metadata**: Spread `metadataTimestampColumns` in the table definition.
- **Naming**: Export as `[name]Model`.

### Example Model Structure

```typescript
import { integer, serial } from 'drizzle-orm/pg-core';

import { metadataTimestampColumns, appPgTable } from '../../core/database';

export const exampleModel = appPgTable(
  'table_name',
  {
    id: serial().primaryKey(),
    // ... other columns
    ...metadataTimestampColumns
  },
  (table) => [
    // Constraints, indexes
  ]
);
```

## Schema Validation (TypeBox)

Schema definitions reside in `schema.ts` files (e.g., `src/context/permission/schema.ts`).

- **Select Schema**: Use `createSelectSchema(model)` from `drizzle-orm/typebox`.
- **Insert Schema**: Use `createInsertSchema(model)`.
- **Customization**: Use `Type.Interface` or `Type.Omit/Partial` to refine schemas for specific API endpoints (e.g., omitting `id` or `contextId` from insertion).
- **Fastify Integration**: Always use `satisfies FastifySchema`.

## Naming Conventions

- **Models**: `suffix: .model.ts`, variable: `[domain]Model`
- **Schemas**: `suffix: schema.ts`, variables: `Select[Domain]Schema`, `Insert[Domain]Schema`, `Create[Domain]Schema`
- **Enums**: `suffix: .interface.ts`, variable: `[Domain]Type`

## Best Practices

1.  **Cascading Deletes**: Always specify `{ onDelete: 'cascade' }` for critical foreign key relations like `contextId`.
2.  **Unique Constraints**: Define unique indexes with `uniqueIndex` in the table extra properties.
3.  **Nullable Types**: Use the `Nullable` helper in `schema.ts` for optional fields that can be null in the database.
