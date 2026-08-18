import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

function loadEnv() {
  const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();
const url = process.env.Neon_URL;
if (!url) throw new Error("Neon_URL is not set");
const sql = neon(url);

async function exec(label, query) {
  process.stdout.write(`${label}… `);
  await sql.query(query);
  console.log("ok");
}

await exec("user.whatsapp", `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "whatsapp" TEXT`);

await exec(
  "OrderSource",
  `DO $$ BEGIN
    CREATE TYPE "OrderSource" AS ENUM ('ACCOUNT_REQUEST', 'GUEST_ORDER', 'MANUAL_GRANT');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$`,
);

await exec(
  "ContactStatus",
  `DO $$ BEGIN
    CREATE TYPE "ContactStatus" AS ENUM ('NEW', 'READ');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$`,
);

for (const [label, query] of [
  ["order.email", `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "email" TEXT`],
  ["order.source", `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "source" "OrderSource"`],
  ["order.amount", `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "amountDzd" INTEGER`],
  ["order.confirmedAt", `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "confirmedAt" TIMESTAMP(3)`],
  ["order.confirmedBy", `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "confirmedById" TEXT`],
]) {
  await exec(label, query);
}

await exec(
  "backfill amount",
  `UPDATE "Order" o
   SET "amountDzd" = COALESCE(c."priceDzd", 0)
   FROM "Course" c
   WHERE o."courseId" = c.id AND o."amountDzd" IS NULL`,
);
await exec("amount default", `UPDATE "Order" SET "amountDzd" = 0 WHERE "amountDzd" IS NULL`);
await exec(
  "source guest",
  `UPDATE "Order" SET "source" = 'GUEST_ORDER' WHERE "source" IS NULL AND "userId" IS NULL`,
);
await exec(
  "source account",
  `UPDATE "Order" SET "source" = 'ACCOUNT_REQUEST' WHERE "source" IS NULL AND "userId" IS NOT NULL`,
);
await exec("amount not null", `ALTER TABLE "Order" ALTER COLUMN "amountDzd" SET DEFAULT 0`);
await exec("amount required", `ALTER TABLE "Order" ALTER COLUMN "amountDzd" SET NOT NULL`);
await exec("source default", `ALTER TABLE "Order" ALTER COLUMN "source" SET DEFAULT 'GUEST_ORDER'`);
await exec("source required", `ALTER TABLE "Order" ALTER COLUMN "source" SET NOT NULL`);
await exec("whatsapp default", `ALTER TABLE "Order" ALTER COLUMN "whatsapp" SET DEFAULT ''`);

await exec(
  "confirmedBy fk",
  `DO $$ BEGIN
    ALTER TABLE "Order"
      ADD CONSTRAINT "Order_confirmedById_fkey"
      FOREIGN KEY ("confirmedById") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$`,
);

await exec(
  "status index",
  `CREATE INDEX IF NOT EXISTS "Order_status_createdAt_idx" ON "Order" ("status", "createdAt")`,
);
await exec("course index", `CREATE INDEX IF NOT EXISTS "Order_courseId_idx" ON "Order" ("courseId")`);

await exec(
  "contact table",
  `CREATE TABLE IF NOT EXISTS "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ContactStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
  )`,
);

const statuses = await sql`
  SELECT e.enumlabel
  FROM pg_enum e
  JOIN pg_type t ON e.enumtypid = t.oid
  WHERE t.typname = 'OrderStatus'
`;
const labels = statuses.map((row) => row.enumlabel);
if (!labels.includes("PAID") || labels.includes("CONTACTED") || labels.includes("CONVERTED")) {
  await exec(
    "new status enum",
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OrderStatus_new') THEN
        CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING', 'PAID', 'COMP', 'REFUNDED');
      END IF;
    END $$`,
  );
  await exec("drop status default", `ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT`);
  await exec(
    "remap status",
    `ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING (
      CASE "status"::text
        WHEN 'CONVERTED' THEN 'PAID'
        WHEN 'CONTACTED' THEN 'PENDING'
        WHEN 'PAID' THEN 'PAID'
        WHEN 'COMP' THEN 'COMP'
        WHEN 'REFUNDED' THEN 'REFUNDED'
        ELSE 'PENDING'
      END::"OrderStatus_new"
    )`,
  );
  await exec("drop old status", `DROP TYPE "OrderStatus"`);
  await exec("rename status", `ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus"`);
  await exec(
    "status default",
    `ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"OrderStatus"`,
  );
}

await exec(
  "backfill enrollment orders",
  `INSERT INTO "Order" (
      "id", "name", "whatsapp", "email", "courseId", "userId",
      "status", "source", "amountDzd", "confirmedAt", "createdAt", "updatedAt"
    )
    SELECT
      concat('cbf_', e.id),
      COALESCE(u.name, u.email),
      COALESCE(u.whatsapp, ''),
      u.email,
      e."courseId",
      e."userId",
      'COMP'::"OrderStatus",
      'MANUAL_GRANT'::"OrderSource",
      COALESCE(c."priceDzd", 0),
      e."createdAt",
      e."createdAt",
      NOW()
    FROM "Enrollment" e
    JOIN "User" u ON u.id = e."userId"
    JOIN "Course" c ON c.id = e."courseId"
    WHERE NOT EXISTS (
      SELECT 1 FROM "Order" o
      WHERE o."userId" = e."userId"
        AND o."courseId" = e."courseId"
        AND o.status IN ('PAID', 'COMP')
    )`,
);

console.log("billing schema migrated");
