import { Prisma, PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function databaseUrl() {
  const raw = process.env.Neon_URL?.trim();
  if (!raw) throw new Error("Neon_URL is not set");
  try {
    const url = new URL(raw);
    url.searchParams.set("sslmode", "require");
    url.searchParams.set("connect_timeout", "30");
    url.searchParams.set("pool_timeout", "30");
    url.searchParams.delete("channel_binding");
    if (url.hostname.includes("-pooler")) {
      url.searchParams.set("pgbouncer", "true");
    }
    return url.toString();
  } catch {
    return raw;
  }
}

function isUnreachable(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("Can't reach database server")) return true;
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P1001") {
    return true;
  }
  return error instanceof Prisma.PrismaClientInitializationError && error.errorCode === "P1001";
}

function createPrisma() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: { db: { url: databaseUrl() } },
  });

  return client.$extends({
    query: {
      async $allOperations({ args, query }) {
        try {
          return await query(args);
        } catch (error) {
          if (!isUnreachable(error)) throw error;
          try {
            await client.$disconnect();
          } catch {
            /* ignore a dead socket */
          }
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return query(args);
        }
      },
    },
  }) as unknown as PrismaClient;
}

/** Prisma connects on first query, so this is safe during `next build`. */
export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
