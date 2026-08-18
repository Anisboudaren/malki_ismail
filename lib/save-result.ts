import { cookies } from "next/headers";

export type SaveResult = { ok: boolean; message: string };

export function flash(result: SaveResult): SaveResult {
  cookies().set("dash-flash", `${result.ok ? "1" : "0"}:${encodeURIComponent(result.message)}`, {
    path: "/",
    maxAge: 12,
    sameSite: "lax",
    httpOnly: false,
  });
  return result;
}

export function sameValue(a: unknown, b: unknown) {
  if (Object.is(a, b)) return true;
  if (a == null && b == null) return true;
  if (typeof a === "number" || typeof b === "number") {
    const left = a == null || a === "" ? null : Number(a);
    const right = b == null || b === "" ? null : Number(b);
    if (left !== null && right !== null && !Number.isNaN(left) && !Number.isNaN(right)) {
      return left === right;
    }
  }
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

export function pickChanged<T extends Record<string, unknown>>(current: T, next: T) {
  const data: Partial<T> = {};
  for (const key of Object.keys(next) as (keyof T)[]) {
    if (!sameValue(current[key], next[key])) data[key] = next[key];
  }
  return data;
}
