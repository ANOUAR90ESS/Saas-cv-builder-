CREATE TABLE "cvs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text DEFAULT 'Untitled CV' NOT NULL,
	"data" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "paddle_events" (
	"event_id" text PRIMARY KEY NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb,
	"received_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"transaction_id" text NOT NULL,
	"user_id" integer,
	"claim_token" text,
	"email" text,
	"amount" integer,
	"currency" text,
	"status" text DEFAULT 'completed' NOT NULL,
	"consumed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "purchases_transaction_id_unique" UNIQUE("transaction_id")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"subscription_id" text NOT NULL,
	"user_id" integer NOT NULL,
	"status" text NOT NULL,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"price_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "subscriptions_subscription_id_unique" UNIQUE("subscription_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
ALTER TABLE "cvs" ADD CONSTRAINT "cvs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "purchases_claim_token_idx" ON "purchases" USING btree ("claim_token");--> statement-breakpoint
CREATE INDEX "purchases_user_idx" ON "purchases" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_user_idx" ON "subscriptions" USING btree ("user_id");