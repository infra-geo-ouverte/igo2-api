ALTER TABLE "catalog" RENAME COLUMN "order" TO "display_order";--> statement-breakpoint
ALTER TABLE "context_tool" RENAME COLUMN "order" TO "display_order";--> statement-breakpoint
ALTER TABLE "profil" RENAME COLUMN "group" TO "group_name";--> statement-breakpoint
ALTER TABLE "tool" RENAME COLUMN "order" TO "display_order";--> statement-breakpoint
ALTER TABLE "user" RENAME TO "api_user";
