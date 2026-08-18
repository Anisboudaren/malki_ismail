export type AppRole = "ADMIN" | "TEACHER" | "STUDENT";

export function dashboardHome(role: AppRole) {
  if (role === "ADMIN") return "/admin";
  if (role === "TEACHER") return "/teacher";
  return "/student";
}
