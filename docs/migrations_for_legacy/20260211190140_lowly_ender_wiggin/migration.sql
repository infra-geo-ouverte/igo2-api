-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
-- SCHEMAS

-- ENUMS (Wrapped in blocks because CREATE TYPE doesn't support IF NOT EXISTS)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_context_permission_typePermission') THEN
        CREATE TYPE "enum_context_permission_typePermission" AS ENUM('read', 'write', 'hide');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_context_scope') THEN
        CREATE TYPE "enum_context_scope" AS ENUM('public', 'public async', 'protected', 'private');
    END IF;
END $$;

-- SEQUENCES
CREATE SEQUENCE IF NOT EXISTS "layer_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 677 CACHE 1;

-- TABLES
CREATE TABLE IF NOT EXISTS "catalog" (
  "id" serial PRIMARY KEY,
  "title" varchar(64) NOT NULL,
  "url" varchar(128),
  "options" json,
  "createdAt" timestamp with time zone NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL,
  "order" integer,
  "profils" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "context" (
  "id" serial PRIMARY KEY,
  "uri" varchar(64) NOT NULL CONSTRAINT "context_uri_key" UNIQUE,
  "title" varchar(128) NOT NULL,
  "icon" varchar(128),
  "owner" varchar(128) NOT NULL,
  "scope" "enum_context_scope" NOT NULL,
  "map" json,
  "createdAt" timestamp with time zone NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "context_access" (
  "id" serial PRIMARY KEY,
  "contextId" integer NOT NULL,
  "calls" integer,
  "createdAt" timestamp with time zone NOT NULL,
  "accessedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "context_hidden" (
  "id" serial PRIMARY KEY,
  "user" varchar(255) NOT NULL,
  "contextId" integer NOT NULL,
  "createdAt" timestamp with time zone NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "context_permission" (
  "id" serial PRIMARY KEY,
  "typePermission" "enum_context_permission_typePermission" NOT NULL,
  "profil" varchar(255) NOT NULL,
  "contextId" integer NOT NULL,
  "createdAt" timestamp with time zone NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "layer" (
  "id" serial PRIMARY KEY,
  "type" varchar(16) NOT NULL,
  "layers" varchar(128),
  "global" boolean,
  "layerOptions" json,
  "sourceOptions" json,
  "createdAt" timestamp with time zone NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL,
  "url" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "layer_context" (
  "id" serial PRIMARY KEY,
  "layerOptions" json,
  "sourceOptions" json,
  "contextId" integer NOT NULL,
  "layerId" integer,
  "createdAt" timestamp with time zone NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "poi" (
  "id" serial PRIMARY KEY,
  "title" varchar(64) NOT NULL,
  "x" numeric NOT NULL,
  "y" numeric NOT NULL,
  "zoom" integer NOT NULL,
  "createdAt" timestamp with time zone NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL,
  "userId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profil_igo" (
  "id" integer PRIMARY KEY,
  "name" varchar(128) NOT NULL,
  "title" varchar(128) NOT NULL,
  "group" varchar(128),
  "preference" json,
  "canShare" boolean,
  "canShareToProfils" varchar,
  "canFilter" boolean,
  "hasAcrigeo" boolean,
  "guides" varchar,
  "hasOsrmPrivateAccess" boolean
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tool" (
  "id" serial PRIMARY KEY,
  "name" varchar(64) NOT NULL,
  "title" varchar(64),
  "tooltip" varchar(128),
  "icon" varchar(128),
  "inToolbar" boolean,
  "global" boolean,
  "order" integer,
  "options" json,
  "createdAt" timestamp with time zone NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL,
  "profils" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tool_context" (
  "id" serial PRIMARY KEY,
  "options" json,
  "enabled" boolean,
  "order" integer,
  "contextId" integer NOT NULL,
  "toolId" integer NOT NULL,
  "createdAt" timestamp with time zone NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
  "id" serial PRIMARY KEY,
  "source" varchar(64) NOT NULL,
  "sourceId" varchar(64) NOT NULL,
  "createdAt" timestamp with time zone NOT NULL,
  "loginAt" timestamp with time zone NOT NULL,
  "firstName" varchar(64),
  "lastName" varchar(64),
  "email" varchar(128)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_igo" (
  "id" serial PRIMARY KEY,
  "defaultContextId" integer,
  "createdAt" timestamp with time zone NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL,
  "userId" integer NOT NULL,
  "preference" json
);

-- INDEXES
CREATE UNIQUE INDEX IF NOT EXISTS "context_access_context_id" ON "context_access" ("contextId");
CREATE INDEX IF NOT EXISTS "context_hidden_context_id" ON "context_hidden" ("contextId");
CREATE UNIQUE INDEX IF NOT EXISTS "context_hidden_context_id_user" ON "context_hidden" ("contextId","user");
CREATE UNIQUE INDEX IF NOT EXISTS "context_hidden_contextId_user" ON "context_hidden" ("user","contextId");
CREATE INDEX IF NOT EXISTS "context_hidden_user" ON "context_hidden" ("user");
CREATE INDEX IF NOT EXISTS "context_owner" ON "context" ("owner");
CREATE INDEX IF NOT EXISTS "context_scope" ON "context" ("scope");
CREATE INDEX IF NOT EXISTS "context_permission_context_id" ON "context_permission" ("contextId");
CREATE UNIQUE INDEX IF NOT EXISTS "context_permission_context_id_profil" ON "context_permission" ("contextId","profil");
CREATE UNIQUE INDEX IF NOT EXISTS "context_permission_contextId_profil" ON "context_permission" ("profil","contextId");
CREATE INDEX IF NOT EXISTS "context_permission_profil" ON "context_permission" ("profil");
CREATE INDEX IF NOT EXISTS "layer_context_context_id" ON "layer_context" ("contextId");
CREATE UNIQUE INDEX IF NOT EXISTS "layer_context_context_id_layer_id" ON "layer_context" ("contextId","layerId");
CREATE UNIQUE INDEX IF NOT EXISTS "layer_context_contextId_layerId" ON "layer_context" ("contextId","layerId");
CREATE INDEX IF NOT EXISTS "layer_context_layer_id" ON "layer_context" ("layerId");
CREATE UNIQUE INDEX IF NOT EXISTS "tool_context_contextId_layerId" ON "layer_context" ("contextId","layerId");
CREATE INDEX IF NOT EXISTS "layer_global" ON "layer" ("global");
CREATE UNIQUE INDEX IF NOT EXISTS "layer_type_url_layers" ON "layer" ("type","url","layers");
CREATE INDEX IF NOT EXISTS "poi_user_id" ON "poi" ("userId");
CREATE INDEX IF NOT EXISTS "tool_context_context_id" ON "tool_context" ("contextId");
CREATE UNIQUE INDEX IF NOT EXISTS "tool_context_context_id_tool_id" ON "tool_context" ("contextId","toolId");
CREATE UNIQUE INDEX IF NOT EXISTS "tool_context_contextId_toolId" ON "tool_context" ("contextId","toolId");
CREATE INDEX IF NOT EXISTS "tool_context_tool_id" ON "tool_context" ("toolId");
CREATE INDEX IF NOT EXISTS "user_igo_user_id" ON "user_igo" ("userId");

-- FOREIGN KEYS (Wrapped in blocks to prevent "Constraint already exists" errors)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'context_access_contextId_fkey') THEN
        ALTER TABLE "context_access" ADD CONSTRAINT "context_access_contextId_fkey" FOREIGN KEY ("contextId") REFERENCES "context"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'context_hidden_contextId_fkey') THEN
        ALTER TABLE "context_hidden" ADD CONSTRAINT "context_hidden_contextId_fkey" FOREIGN KEY ("contextId") REFERENCES "context"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'context_permission_contextId_fkey') THEN
        ALTER TABLE "context_permission" ADD CONSTRAINT "context_permission_contextId_fkey" FOREIGN KEY ("contextId") REFERENCES "context"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'layer_context_contextId_fkey') THEN
        ALTER TABLE "layer_context" ADD CONSTRAINT "layer_context_contextId_fkey" FOREIGN KEY ("contextId") REFERENCES "context"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'layer_context_layerId_fkey') THEN
        ALTER TABLE "layer_context" ADD CONSTRAINT "layer_context_layerId_fkey" FOREIGN KEY ("layerId") REFERENCES "layer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'poi_userId_fkey') THEN
        ALTER TABLE "poi" ADD CONSTRAINT "poi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tool_context_toolId_fkey') THEN
        ALTER TABLE "tool_context" ADD CONSTRAINT "tool_context_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_igo_userId_fkey') THEN
        ALTER TABLE "user_igo" ADD CONSTRAINT "user_igo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
