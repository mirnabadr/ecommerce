-- Migration to add stripe_session_id to orders table
-- Run this if db:push didn't work

-- Add stripe_session_id column if it doesn't exist
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "stripe_session_id" text;

-- Create unique index if it doesn't exist
CREATE UNIQUE INDEX IF NOT EXISTS "orders_stripe_session_id_unique" ON "orders"("stripe_session_id");

-- Make shipping and billing addresses optional (if not already)
ALTER TABLE "orders" ALTER COLUMN "shipping_address_id" DROP NOT NULL;
ALTER TABLE "orders" ALTER COLUMN "billing_address_id" DROP NOT NULL;

