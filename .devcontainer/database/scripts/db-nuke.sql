-- Delete Drizzle shit
DROP SCHEMA IF EXISTS migrations CASCADE;
DROP SCHEMA IF EXISTS igo CASCADE;

-- 1. Delete Foreign Tables
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT foreign_table_name
              FROM information_schema.foreign_tables
              WHERE foreign_table_schema = current_schema()) LOOP
        EXECUTE 'DROP FOREIGN TABLE IF EXISTS ' || quote_ident(r.foreign_table_name) || ' CASCADE';
    END LOOP;
END $$;

-- 2. Delete all standard tables
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema() AND tablename != 'spatial_ref_sys') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

-- 3. Delete Sequences
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
              WHERE c.relkind = 'S' AND n.nspname = current_schema()) LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.relname) || ' CASCADE';
    END LOOP;
END $$;

-- 4. Delete enums
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT DISTINCT t.typname as enum_name
              FROM pg_type t
              JOIN pg_enum e ON t.oid = e.enumtypid
              JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
              WHERE n.nspname = current_schema()) LOOP
        EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.enum_name) || ' CASCADE';
    END LOOP;
END $$;

-- 5. Delete the role admgeo1
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admgeo1') THEN
        EXECUTE 'DROP OWNED BY admgeo1';
        EXECUTE 'DROP ROLE admgeo1';
    END IF;
END $$;
