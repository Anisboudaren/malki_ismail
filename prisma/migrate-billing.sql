-- Phase 3: billing + contact. Safe to re-run.

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "whatsapp" TEXT;

DO $$ BEGIN
  CREATE TYPE "OrderSource" AS ENUM ('ACCOUNT_REQUEST', 'GUEST_ORDER', 'MANUAL_GRANT');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ContactStatus" AS ENUM ('NEW', 'READ');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "source" "OrderSource";
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "amountDzd" INTEGER;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "confirmedAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "confirmedById" TEXT;

UPDATE "Order" o
SET "amountDzd" = COALESCE(c."priceDzd", 0)
FROM "Course" c
WHERE o."courseId" = c.id AND o."amountDzd" IS NULL;

UPDATE "Order" SET "amountDzd" = 0 WHERE "amountDzd" IS NULL;
UPDATE "Order" SET "source" = 'GUEST_ORDER' WHERE "source" IS NULL AND "userId" IS NULL;
UPDATE "Order" SET "source" = 'ACCOUNT_REQUEST' WHERE "source" IS NULL AND "userId" IS NOT NULL;

ALTER TABLE "Order" ALTER COLUMN "amountDzd" SET DEFAULT 0;
ALTER TABLE "Order" ALTER COLUMN "amountDzd" SET NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "source" SET DEFAULT 'GUEST_ORDER';
ALTER TABLE "Order" ALTER COLUMN "source" SET NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "whatsapp" SET DEFAULT '';

DO $$ BEGIN
  ALTER TABLE "Order"
    ADD CONSTRAINT "Order_confirmedById_fkey"
    FOREIGN KEY ("confirmedById") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "Order_status_createdAt_idx" ON "Order" ("status", "createdAt");
CREATE INDEX IF NOT EXISTS "Order_courseId_idx" ON "Order" ("courseId");

-- Remap old lead statuses onto the billing enum.
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'PAID';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'COMP';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'REFUNDED';
