CREATE TYPE "enum_context_type_permission" AS ENUM('read', 'write');--> statement-breakpoint
CREATE TYPE "enum_layer_type" AS ENUM('group', 'wms', 'wfs', 'vector', 'wmts', 'xyz', 'osm', 'tiledebug', 'carto', 'arcgisrest', 'imagearcgisrest', 'tilearcgisrest', 'websocket', 'mvt', 'cluster');--> statement-breakpoint
ALTER TABLE "context_permission" DROP CONSTRAINT "check_only_one_target";--> statement-breakpoint
ALTER INDEX "context_access_context_id" RENAME TO "uq_context_access_context";--> statement-breakpoint
ALTER INDEX "context_hidden_context_id" RENAME TO "uq_context_hidden_context_user";--> statement-breakpoint
ALTER INDEX "layer_context_context_id_layer_id" RENAME TO "uq_context_layer_context_layer";--> statement-breakpoint
ALTER INDEX "layer_context_context_id" RENAME TO "idx_context_layer_context_id";--> statement-breakpoint
ALTER INDEX "layer_context_layer_id" RENAME TO "idx_context_layer_layer_id";--> statement-breakpoint
ALTER INDEX "tool_context_context_id_tool_id" RENAME TO "uq_context_tool_context_tool";--> statement-breakpoint
ALTER INDEX "tool_context_context_id" RENAME TO "idx_context_tool_context_id";--> statement-breakpoint
ALTER INDEX "tool_context_tool_id" RENAME TO "idx_context_tool_tool_id";--> statement-breakpoint
ALTER INDEX "poi_user_id" RENAME TO "idx_poi_user_id";--> statement-breakpoint
ALTER INDEX "user_igo_user_id" RENAME TO "idx_user_external_id";--> statement-breakpoint
DROP INDEX "context_permission_context_id";--> statement-breakpoint
DROP INDEX "context_scope";--> statement-breakpoint
DROP INDEX "layer_global";--> statement-breakpoint
DROP INDEX "layer_type_url_layers";--> statement-breakpoint
ALTER TABLE "context_access" RENAME CONSTRAINT "context_access_contextId_fkey" TO "context_access_context_id_context_id_fkey";--> statement-breakpoint
ALTER TABLE "context_hidden" RENAME CONSTRAINT "context_hidden_contextId_fkey" TO "context_hidden_context_id_context_id_fkey";--> statement-breakpoint
ALTER TABLE "context_layer" RENAME CONSTRAINT "layer_context_contextId_fkey" TO "context_layer_context_id_context_id_fkey";--> statement-breakpoint
ALTER TABLE "context_layer" RENAME CONSTRAINT "layer_context_layerId_fkey" TO "context_layer_layer_id_layer_id_fkey";--> statement-breakpoint
ALTER TABLE "context_permission" RENAME CONSTRAINT "context_permission_contextId_fkey" TO "context_permission_context_id_context_id_fkey";--> statement-breakpoint
ALTER TABLE "context_tool" RENAME CONSTRAINT "tool_context_toolId_fkey" TO "context_tool_tool_id_tool_id_fkey";--> statement-breakpoint
ALTER TABLE "context_access" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "context_layer" RENAME CONSTRAINT "layer_context_pkey" TO "context_layer_pkey";--> statement-breakpoint
ALTER TABLE "context_tool" RENAME CONSTRAINT "tool_context_pkey" TO "context_tool_pkey";--> statement-breakpoint
ALTER TABLE "profil" RENAME CONSTRAINT "profil_igo_pkey" TO "profil_pkey";--> statement-breakpoint
ALTER TABLE "user" RENAME CONSTRAINT "user_igo_pkey" TO "user_pkey";--> statement-breakpoint
ALTER TABLE "context" ALTER COLUMN "scope" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "enum_context_scope";--> statement-breakpoint
CREATE TYPE "enum_context_scope" AS ENUM('public', 'protected', 'private');--> statement-breakpoint
ALTER TABLE "context" ALTER COLUMN "scope" SET DATA TYPE "enum_context_scope" USING "scope"::"enum_context_scope";--> statement-breakpoint
CREATE SEQUENCE "profil_id_seq";--> statement-breakpoint
ALTER TABLE "profil" ALTER COLUMN "id" SET DEFAULT nextval('profil_id_seq')--> statement-breakpoint
ALTER SEQUENCE "profil_id_seq" OWNED BY "profil"."id";--> statement-breakpoint
ALTER TABLE "profil" ALTER COLUMN "id" SET DATA TYPE int USING "id"::int;--> statement-breakpoint
ALTER TABLE "context_permission" ALTER COLUMN "type_permission" SET DATA TYPE "enum_context_type_permission" USING "type_permission"::text::"enum_context_type_permission";--> statement-breakpoint
ALTER TABLE "layer" ALTER COLUMN "type" SET DATA TYPE "enum_layer_type" USING "type"::"enum_layer_type";--> statement-breakpoint
ALTER TABLE "context_access" ALTER COLUMN "calls" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "poi" ALTER COLUMN "x" SET DATA TYPE double precision USING "x"::double precision;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "context_hidden" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "poi" ALTER COLUMN "y" SET DATA TYPE double precision USING "y"::double precision;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "context_access" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "context_permission" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "context_access" ALTER COLUMN "accessed_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "context_hidden" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "catalog" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "context_layer" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "poi" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "catalog" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "context_permission" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "poi" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "context_tool" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "layer" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "profil"
  ALTER COLUMN "can_share_to_profils"
  SET DATA TYPE integer[]
  USING string_to_array("can_share_to_profils", ',')::integer[];--> statement-breakpoint
ALTER TABLE "context_layer" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "catalog"
  ALTER COLUMN "profils"
  SET DATA TYPE text[]
  USING string_to_array("profils", ',')::text[];--> statement-breakpoint
ALTER TABLE "layer" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "context" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "context_tool" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "layer" ALTER COLUMN "url" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "context" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "profil"
  ALTER COLUMN "guides"
  SET DATA TYPE text[]
  USING string_to_array("guides", ',')::text[];--> statement-breakpoint
ALTER TABLE "tool" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "tool" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "tool"
  ALTER COLUMN "profils"
  SET DATA TYPE text[]
  USING string_to_array("profils", ',')::text[];--> statement-breakpoint
DROP INDEX "uq_context_hidden_context_user";--> statement-breakpoint
CREATE UNIQUE INDEX "uq_context_hidden_context_user" ON "context_hidden" ("context_id","user_id");--> statement-breakpoint
ALTER TABLE "user" RENAME CONSTRAINT "user_external_id" TO "user_external_id_key";--> statement-breakpoint
ALTER TABLE "tool" ADD CONSTRAINT "tool_name_key" UNIQUE("name");--> statement-breakpoint
CREATE INDEX "idx_context_hidden_context_id" ON "context_hidden" ("context_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_context_permission_user_context" ON "context_permission" ("context_id","user_id") WHERE "user_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_context_permission_profil_context" ON "context_permission" ("context_id","profil_id") WHERE "profil_id" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "context_tool" ADD CONSTRAINT "context_tool_context_id_context_id_fkey" FOREIGN KEY ("context_id") REFERENCES "context"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "context" DROP CONSTRAINT "context_user_id_user_id_fkey", ADD CONSTRAINT "context_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "context_access" DROP CONSTRAINT "context_access_context_id_context_id_fkey", ADD CONSTRAINT "context_access_context_id_context_id_fkey" FOREIGN KEY ("context_id") REFERENCES "context"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "context_hidden" DROP CONSTRAINT "context_hidden_context_id_context_id_fkey", ADD CONSTRAINT "context_hidden_context_id_context_id_fkey" FOREIGN KEY ("context_id") REFERENCES "context"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "context_hidden" DROP CONSTRAINT "context_hidden_user_id_user_id_fkey", ADD CONSTRAINT "context_hidden_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "context_permission" DROP CONSTRAINT "context_permission_context_id_context_id_fkey", ADD CONSTRAINT "context_permission_context_id_context_id_fkey" FOREIGN KEY ("context_id") REFERENCES "context"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "context_permission" DROP CONSTRAINT "context_permission_profil_id_profil_id_fkey", ADD CONSTRAINT "context_permission_profil_id_profil_id_fkey" FOREIGN KEY ("profil_id") REFERENCES "profil"("id");--> statement-breakpoint
ALTER TABLE "context_permission" DROP CONSTRAINT "context_permission_user_id_user_id_fkey", ADD CONSTRAINT "context_permission_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "context_layer" DROP CONSTRAINT "context_layer_context_id_context_id_fkey", ADD CONSTRAINT "context_layer_context_id_context_id_fkey" FOREIGN KEY ("context_id") REFERENCES "context"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "context_layer" DROP CONSTRAINT "context_layer_layer_id_layer_id_fkey", ADD CONSTRAINT "context_layer_layer_id_layer_id_fkey" FOREIGN KEY ("layer_id") REFERENCES "layer"("id");--> statement-breakpoint
ALTER TABLE "poi" DROP CONSTRAINT "poi_user_id_user_id_fkey", ADD CONSTRAINT "poi_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "context_tool" DROP CONSTRAINT "context_tool_tool_id_tool_id_fkey", ADD CONSTRAINT "context_tool_tool_id_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tool"("id");--> statement-breakpoint
ALTER TABLE "context_permission" ADD CONSTRAINT "uq_context_permission_user_profil_one_not_null" CHECK (("user_id" IS NOT NULL AND "profil_id" IS NULL) OR ("user_id" IS NULL AND "profil_id" IS NOT NULL));--> statement-breakpoint
DROP TYPE "enum_context_permission_typePermission";--> statement-breakpoint

-- Missing constraint:
CREATE UNIQUE INDEX "uq_layer_type_url_layers" ON "layer" ("type","url","layers");--> statement-breakpoint

-- Resync the serial_sequence, it was absent on the legacy system then insert the admin for WSS
SELECT setval( pg_get_serial_sequence('profil', 'id'), (SELECT MAX(id) FROM "profil") );--> statement-breakpoint
INSERT INTO profil (name, title) VALUES ('admin', 'Administrateur WSS');--> statement-breakpoint

