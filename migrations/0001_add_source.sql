ALTER TABLE "documents" ADD COLUMN "source" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "created_at" timestamp DEFAULT now();