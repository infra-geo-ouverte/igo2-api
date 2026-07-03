-- Custom SQL migration file, put your code below! --

---
--- 1. User - Delete duplicata and Backfill missing user_igo records with the user table. The user_igo table will become our source of truth
---
DELETE FROM user_igo
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
              ROW_NUMBER() OVER (
                  PARTITION BY "userId"
                  ORDER BY "updatedAt" DESC, id DESC
              ) as row_num
        FROM user_igo
    ) t
    WHERE t.row_num > 1
);--> statement-breakpoint

INSERT INTO "user_igo" ("userId", "preference", "createdAt", "updatedAt")
SELECT u.id,
  '{}'::json,
  NOW(),
  NOW()
FROM "user" u
  LEFT JOIN "user_igo" ui ON u.id = ui."userId"
WHERE ui.id IS NULL;--> statement-breakpoint

---
--- 2. Remove the old foreign key constraint from that point to the user legacy table
---
ALTER TABLE "poi" DROP CONSTRAINT IF EXISTS "poi_userId_fkey";--> statement-breakpoint
ALTER TABLE "user_igo" DROP CONSTRAINT IF EXISTS "user_igo_userId_fkey";--> statement-breakpoint

---
--- 3. POI - Update the data in poi.userId to point to the user_igo table
---
UPDATE "poi"
SET "userId" = u_igo.id
FROM "user_igo" AS u_igo
WHERE "poi"."userId" = u_igo."userId";--> statement-breakpoint

---
--- 4. CONTEXT - Migrate the "owner" to "userId" column
---
ALTER TABLE "context" ADD COLUMN "userId" INTEGER;--> statement-breakpoint

-- Assign the corresponsing userId
UPDATE "context"
SET "userId" = u_igo.id
FROM "user" AS u_legacy
  JOIN "user_igo" AS u_igo ON u_legacy.id = u_igo."userId"
WHERE "context"."owner" = u_legacy."sourceId"
  AND "context"."owner" <> 'admin';--> statement-breakpoint

-- For the only admin context assign the null value
DELETE FROM "context"
WHERE "owner" <> 'admin'
  AND ("userId" IS NULL OR "owner" NOT IN (SELECT "sourceId" FROM "user"));--> statement-breakpoint

ALTER TABLE "context" DROP COLUMN "owner";--> statement-breakpoint

---
--- 5. ContextHidden - Migrate the data in ContextHidden user to userId
---
ALTER TABLE "context_hidden"
ADD COLUMN "userId" INTEGER;--> statement-breakpoint
UPDATE "context_hidden"
SET "userId" = u_igo.id
FROM "user" AS u_legacy
  JOIN "user_igo" AS u_igo ON u_legacy.id = u_igo."userId"
WHERE "context_hidden"."user" = u_legacy."sourceId"
  AND "context_hidden"."user" <> 'admin';--> statement-breakpoint

ALTER TABLE "context_hidden" DROP COLUMN "user";--> statement-breakpoint

---
--- ContextPermission - migrate "profil" column to "userId" or "profildId"
---
ALTER TABLE context_permission ADD COLUMN "userId" INTEGER;--> statement-breakpoint
ALTER TABLE context_permission ADD COLUMN "profilId" INTEGER;--> statement-breakpoint

-- Migration vers userId
UPDATE context_permission cp
SET "userId" = u_igo.id
FROM "user" AS u_legacy
  JOIN "user_igo" AS u_igo ON u_legacy.id = u_igo."userId"
WHERE cp.profil = u_legacy."sourceId";--> statement-breakpoint

-- Migration vers profilId
UPDATE context_permission cp
SET "profilId" = p.id
FROM profil_igo p
WHERE cp.profil = p.name;--> statement-breakpoint

ALTER TABLE context_permission DROP COLUMN profil;--> statement-breakpoint

ALTER TABLE context_permission
  ADD CONSTRAINT check_only_one_target
  CHECK (
      ("userId" IS NOT NULL AND "profilId" IS NULL) OR
      ("userId" IS NULL AND "profilId" IS NOT NULL)
  );--> statement-breakpoint


---
--- 6. UserLegacy - Remove the user table
---
DROP TABLE IF EXISTS "user" CASCADE;--> statement-breakpoint


---
--- 7. Rename tables to remove the suffix "igo" and move layer and tool as context for the root entity
---
DROP INDEX IF EXISTS "tool_context_contextId_layerId";--> statement-breakpoint
DROP INDEX IF EXISTS "tool_context_contextId_toolId";--> statement-breakpoint
DROP INDEX IF EXISTS "layer_context_contextId_layerId";--> statement-breakpoint

ALTER TABLE IF EXISTS "layer_context" RENAME TO "context_layer";--> statement-breakpoint

ALTER TABLE IF EXISTS "tool_context" RENAME TO "context_tool";--> statement-breakpoint

ALTER TABLE IF EXISTS "profil_igo" RENAME TO "profil";--> statement-breakpoint

ALTER TABLE IF EXISTS "user_igo" RENAME COLUMN "userId" TO "externalId";--> statement-breakpoint

ALTER TABLE IF EXISTS "user_igo" RENAME TO "user";--> statement-breakpoint

DROP INDEX IF EXISTS "context_permission_contextId_profil";--> statement-breakpoint

---
--- 8. Reset the foreign key constraint for POI on the new user table
---
ALTER TABLE "poi"
  ADD CONSTRAINT "poi_user_id_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE;--> statement-breakpoint
--
ALTER TABLE "context"
  ADD CONSTRAINT "context_user_id_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE;--> statement-breakpoint
--
ALTER TABLE "context_hidden"
  ADD CONSTRAINT "context_hidden_user_id_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE;--> statement-breakpoint
--
ALTER TABLE "context_permission"
  ADD CONSTRAINT "context_permission_user_id_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "context_permission"
  ADD CONSTRAINT "context_permission_profil_id_profil_id_fkey" FOREIGN KEY ("profilId") REFERENCES "profil"(id) ON DELETE CASCADE;--> statement-breakpoint
--
ALTER TABLE "user"
    ALTER COLUMN "externalId" SET NOT NULL,
    ADD CONSTRAINT user_external_id UNIQUE ("externalId");--> statement-breakpoint


---
--- 9. LAYER - Replace the public folder for the frontend application
---
UPDATE "layer"
SET "sourceOptions" = REPLACE(
    "sourceOptions"::TEXT,
    '/igo2/portail/particular',
    ''
  )::JSONB
WHERE "sourceOptions"::TEXT LIKE '%/igo2/portail/particular%';--> statement-breakpoint


-- 9.1 Supprimer les layers qui n'ont pas d'URL
DELETE FROM layer
WHERE url IS NULL OR url = '';--> statement-breakpoint

-- 9.2 Supprimer les layers qui sont de type wms sans nom de layers
DELETE FROM layer
WHERE type = 'wms' AND layers IS NULL;--> statement-breakpoint

-- 9.3 Supprimer les lignes où la colonne url contient la chaîne de caractères 'null'
DELETE FROM layer
WHERE url LIKE '%/null%';--> statement-breakpoint

-- 9.4 Supprimer les layers sans options (source et layer) qui ne sont pas liés à un contexte
DELETE FROM layer l
WHERE l."sourceOptions" IS NULL
  AND l."layerOptions" IS NULL
  AND NOT EXISTS (
      SELECT 1
      FROM context_layer cl
      WHERE cl."layerId" = l.id
  );--> statement-breakpoint


---
--- 12. RENAME COLUMN TO SNACK_CASE
---
DO $$
DECLARE
    r RECORD;
    new_col_name TEXT;
BEGIN
    FOR r IN
        SELECT table_schema, table_name, column_name
        FROM information_schema.columns
        -- Limit scope to public and igo schemas
        WHERE table_schema IN ('public', 'igo')
    LOOP
        -- Regex: Finds uppercase letters preceded by a char/digit and adds underscore
        new_col_name := lower(regexp_replace(r.column_name, '([a-z0-9])([A-Z])', '\1_\2', 'g'));

        -- Only proceed if the name needs a change
        IF new_col_name <> r.column_name THEN
            BEGIN
                EXECUTE format('ALTER TABLE %I.%I RENAME COLUMN %I TO %I',
                    r.table_schema, r.table_name, r.column_name, new_col_name);
                RAISE NOTICE 'Renamed % in %.% to %', r.column_name, r.table_schema, r.table_name, new_col_name;
            EXCEPTION WHEN OTHERS THEN
                RAISE WARNING 'Could not rename column % in table %.% - it might be a dependency issue.',
                    r.column_name, r.table_schema, r.table_name;
            END;
        END IF;
    END LOOP;
END $$;--> statement-breakpoint

---
--- 13. RENAME THE "admin" PROFIL FOR "igo-admin"
---
UPDATE profil SET name = 'igo-admin' WHERE name = 'admin';--> statement-breakpoint
