ALTER TABLE "layer" ALTER COLUMN "global" SET DEFAULT false;--> statement-breakpoint
UPDATE "layer" SET "global" = false WHERE "global" IS NULL;--> statement-breakpoint
ALTER TABLE "layer" ALTER COLUMN "global" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tool" ALTER COLUMN "global" SET DEFAULT false;--> statement-breakpoint
UPDATE "tool" SET "global" = false WHERE "global" IS NULL;--> statement-breakpoint
ALTER TABLE "tool" ALTER COLUMN "global" SET NOT NULL;
