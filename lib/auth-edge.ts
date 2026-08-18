import { neon } from "@neondatabase/serverless";

import { sessionCookieName } from "@/lib/auth-cookie";
import type { AppRole } from "@/lib/dashboard-home";

type EdgeSession = { role: AppRole; suspended: boolean };

/**
 * Edge-safe session lookup for middleware. Prisma cannot run on the Edge
 * runtime, so this uses Neon's HTTP driver against the same Session table
 * Auth.js / Prisma write from Node.
 */
export async function getEdgeSession(
  cookieHeader: string | null,
): Promise<EdgeSession | null> {
  const token = readSessionToken(cookieHeader);
  const url = process.env.Neon_URL;
  if (!token || !url) return null;

  const sql = neon(url);
  const rows = (await sql`
    SELECT u.role, u.suspended
    FROM "Session" s
    JOIN "User" u ON u.id = s."userId"
    WHERE s."sessionToken" = ${token}
      AND s.expires > NOW()
    LIMIT 1
  `) as EdgeSession[];
  return rows[0] ?? null;
}

function readSessionToken(cookieHeader: string | null) {
  if (!cookieHeader) return null;
  const names = [
    sessionCookieName(),
    "authjs.session-token",
    "__Secure-authjs.session-token",
  ];
  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rest] = part.trim().split("=");
    if (names.includes(rawName)) return decodeURIComponent(rest.join("="));
  }
  return null;
}
