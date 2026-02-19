# Modular Domain Architecture & Clean Code Standards

This document defines the project's directory structure, naming conventions, and core engineering principles to ensure a maintainable and scalable codebase.

## 1. Clean Code Principles (Micro-Level)

### SOLID Principles

- **Single Responsibility (SRP)**: Each file/class has one reason to change.
- **Open-Closed (OCP)**: Entities are open for extension but closed for modification.
- **Liskov Substitution (LSP)**: Derived types must be substitutable for their base types.
- **Interface Segregation (ISP)**: No client should be forced to depend on methods it does not use.
- **Dependency Inversion (DIP)**: Depend on abstractions, not concretions.

### Meaningful Naming & Readability

- Code should communicate **intent** clearly.
- Functions should do **one thing** and have descriptive, verb-based names.
- Avoid generic names like `data` or `item`; be specific (e.g., `userProfile`).

### DRY (Don't Repeat Yourself)

- Reduce redundancy through proper abstraction.
- If logic is repeated 3 times, extract it.

### Readable Over Clever

- Write code for humans first.
- Prioritize maintainability over overly condensed, complex one-liners or "clever" tricks.

## 2. Directory Structure

Each feature or domain is contained within its own directory in `src/`:

```text
src/
  [domain]/
    [domain].route.ts       # Framework Entry (SRP: Fastify config)
    [domain].schema.ts      # Validation Contract (SRP: TypeBox schemas)
    [domain].controller.ts  # Request Handling (SRP: HTTP Orchestration)
    [domain].service.ts     # Business Logic (SRP: Pure Logic/DB)
    [domain].model.ts       # Data Definition (SRP: Drizzle table)
    [domain].relation.ts    # Data Relationships (SRP: Drizzle relations)
    [domain].interface.ts   # Entities & Abstractions (SRP: Types)
    index.ts                # Public API / Barrel file
```

## 3. Naming Conventions (Search-First)

Always prefix files with their **domain name (singular)**.

- **`[domain].route.ts`** (Correct: `user.route.ts` | Incorrect: `routes.ts`)
- **`[domain].schema.ts`** (Correct: `catalog.schema.ts` | Incorrect: `schema.ts`)

> [!TIP]
> **Search-First Naming**: Prefixed filenames allow you to find exactly what you need in global search and differentiate between multiple open `route` or `schema` tabs in your IDE.

## 4. Layer Responsibilities & Dependencies

Dependencies must always flow **downwards** to maintain separation:
**Route** → **Controller** → **Service** → **Model**

- **Services** are agnostic of the HTTP layer (Fastify).
- **Controllers** orchestrate the flow but contain no business logic.
- Use **Interfaces** to decouple cross-module dependencies (DIP).
