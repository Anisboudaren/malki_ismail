import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { dashboardHome } from "@/lib/dashboard-home";
import { touchSession } from "@/lib/auth-session";

export async function getAuthUser() {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) return null;
  if (user.suspended) return null;
  void touchSession(user.id);
  return user;
}

/** Session for the public header — no session-touch write on every page. */
export async function getNavUser() {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || user.suspended) return null;
  return {
    name: user.name ?? null,
    email: user.email ?? null,
    role: user.role,
  };
}

export async function requireUser() {
  const user = await getAuthUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(role: Role) {
  const user = await requireUser();
  if (user.role !== role) redirect(dashboardHome(user.role));
  return user;
}

export async function requireEditor() {
  const user = await requireUser();
  if (user.role !== Role.ADMIN && user.role !== Role.TEACHER) {
    redirect(dashboardHome(user.role));
  }
  return user;
}
