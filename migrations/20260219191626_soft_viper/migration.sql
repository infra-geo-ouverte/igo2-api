CREATE TYPE "public"."enum_context_scope" AS ENUM('public', 'protected', 'private');--> statement-breakpoint
CREATE TYPE "public"."enum_context_type_permission" AS ENUM('read', 'write');--> statement-breakpoint
CREATE TYPE "public"."enum_layer_type" AS ENUM('group', 'wms', 'wfs', 'vector', 'wmts', 'xyz', 'osm', 'tiledebug', 'carto', 'arcgisrest', 'imagearcgisrest', 'tilearcgisrest', 'websocket', 'mvt', 'cluster');--> statement-breakpoint
CREATE TABLE "public"."catalog" (
	"id" serial PRIMARY KEY,
	"title" varchar(64) NOT NULL,
	"url" varchar(128),
	"options" json,
	"order" integer,
	"profils" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "public"."context_access" (
	"id" serial PRIMARY KEY,
	"context_id" integer NOT NULL,
	"calls" integer DEFAULT 0,
	"accessed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "public"."context" (
	"id" serial PRIMARY KEY,
	"uri" varchar(64) NOT NULL UNIQUE,
	"title" varchar(128) NOT NULL,
	"icon" varchar(128),
	"scope" "public"."enum_context_scope" NOT NULL,
	"map" json,
	"user_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "public"."context_hidden" (
	"id" serial PRIMARY KEY,
	"user_id" integer,
	"context_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "public"."context_layer" (
	"id" serial PRIMARY KEY,
	"layer_options" json,
	"source_options" json,
	"context_id" integer NOT NULL,
	"layer_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "public"."context_permission" (
	"id" serial PRIMARY KEY,
	"type_permission" "public"."enum_context_type_permission" NOT NULL,
	"profil_id" integer,
	"user_id" integer,
	"context_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_context_permission_user_profil_one_not_null" CHECK (("user_id" IS NOT NULL AND "profil_id" IS NULL) OR ("user_id" IS NULL AND "profil_id" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "public"."context_tool" (
	"id" serial PRIMARY KEY,
	"enabled" boolean,
	"context_id" integer NOT NULL,
	"tool_id" integer NOT NULL,
	"order" integer,
	"options" json,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "public"."layer" (
	"id" serial PRIMARY KEY,
	"type" "public"."enum_layer_type" NOT NULL,
	"url" varchar NOT NULL,
	"layers" varchar(128),
	"global" boolean,
	"layer_options" json,
	"source_options" json,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "public"."poi" (
	"id" serial PRIMARY KEY,
	"title" varchar(64) NOT NULL,
	"x" double precision NOT NULL,
	"y" double precision NOT NULL,
	"zoom" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "public"."profil" (
	"id" serial PRIMARY KEY,
	"name" varchar(128) NOT NULL,
	"title" varchar(128) NOT NULL,
	"group" varchar(128),
	"preference" json,
	"can_share" boolean,
	"can_share_to_profils" integer[],
	"can_filter" boolean,
	"has_acrigeo" boolean,
	"guides" text[],
	"has_osrm_private_access" boolean
);
--> statement-breakpoint
CREATE TABLE "public"."tool" (
	"id" serial PRIMARY KEY,
	"name" varchar(64) NOT NULL UNIQUE,
	"title" varchar(64),
	"tooltip" varchar(128),
	"icon" varchar(128),
	"in_toolbar" boolean,
	"global" boolean,
	"profils" text[],
	"order" integer,
	"options" json,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "public"."user" (
	"id" serial PRIMARY KEY,
	"default_context_id" integer,
	"preference" json,
	"external_id" integer NOT NULL UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "uq_context_access_context" ON "public"."context_access" ("context_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_context_hidden_context_user" ON "public"."context_hidden" ("context_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_context_hidden_context_id" ON "public"."context_hidden" ("context_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_context_layer_context_layer" ON "public"."context_layer" ("context_id","layer_id");--> statement-breakpoint
CREATE INDEX "idx_context_layer_context_id" ON "public"."context_layer" ("context_id");--> statement-breakpoint
CREATE INDEX "idx_context_layer_layer_id" ON "public"."context_layer" ("layer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_context_permission_user_context" ON "public"."context_permission" ("context_id","user_id") WHERE "user_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_context_permission_profil_context" ON "public"."context_permission" ("context_id","profil_id") WHERE "profil_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_context_tool_context_tool" ON "public"."context_tool" ("context_id","tool_id");--> statement-breakpoint
CREATE INDEX "idx_context_tool_context_id" ON "public"."context_tool" ("context_id");--> statement-breakpoint
CREATE INDEX "idx_context_tool_tool_id" ON "public"."context_tool" ("tool_id");--> statement-breakpoint
CREATE INDEX "idx_poi_user_id" ON "public"."poi" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_external_id" ON "public"."user" ("external_id");--> statement-breakpoint
ALTER TABLE "public"."context_access" ADD CONSTRAINT "context_access_context_id_context_id_fkey" FOREIGN KEY ("context_id") REFERENCES "public"."context"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "public"."context" ADD CONSTRAINT "context_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id");--> statement-breakpoint
ALTER TABLE "public"."context_hidden" ADD CONSTRAINT "context_hidden_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id");--> statement-breakpoint
ALTER TABLE "public"."context_hidden" ADD CONSTRAINT "context_hidden_context_id_context_id_fkey" FOREIGN KEY ("context_id") REFERENCES "public"."context"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "public"."context_layer" ADD CONSTRAINT "context_layer_context_id_context_id_fkey" FOREIGN KEY ("context_id") REFERENCES "public"."context"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "public"."context_layer" ADD CONSTRAINT "context_layer_layer_id_layer_id_fkey" FOREIGN KEY ("layer_id") REFERENCES "public"."layer"("id");--> statement-breakpoint
ALTER TABLE "public"."context_permission" ADD CONSTRAINT "context_permission_profil_id_profil_id_fkey" FOREIGN KEY ("profil_id") REFERENCES "public"."profil"("id");--> statement-breakpoint
ALTER TABLE "public"."context_permission" ADD CONSTRAINT "context_permission_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id");--> statement-breakpoint
ALTER TABLE "public"."context_permission" ADD CONSTRAINT "context_permission_context_id_context_id_fkey" FOREIGN KEY ("context_id") REFERENCES "public"."context"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "public"."context_tool" ADD CONSTRAINT "context_tool_context_id_context_id_fkey" FOREIGN KEY ("context_id") REFERENCES "public"."context"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "public"."context_tool" ADD CONSTRAINT "context_tool_tool_id_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "public"."tool"("id");--> statement-breakpoint
ALTER TABLE "public"."poi" ADD CONSTRAINT "poi_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id");
