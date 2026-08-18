import { NextResponse, type NextRequest } from "next/server";

import { dashboardHome, type AppRole } from "@/lib/dashboard-home";
import { getEdgeSession } from "@/lib/auth-edge";

const ROLE_PREFIX: Record<string, AppRole> = {
  admin: "ADMIN",
  teacher: "TEACHER",
  student: "STUDENT",
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await getEdgeSession(req.headers.get("cookie"));
  const first = pathname.split("/")[1];
  const needed = ROLE_PREFIX[first ?? ""];

  if (pathname === "/inscription" || pathname.endsWith("/inscription")) {
    if (session && !session.suspended) {
      return NextResponse.redirect(new URL(dashboardHome(session.role), req.url));
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname === "/login" || pathname.startsWith("/login/")) {
    if (session && !session.suspended) {
      return NextResponse.redirect(new URL(dashboardHome(session.role), req.url));
    }
    return NextResponse.next();
  }

  if (!needed) return NextResponse.next();

  if (!session || session.suspended) {
    const login = new URL("/login", req.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (session.role !== needed) {
    return NextResponse.redirect(new URL(dashboardHome(session.role), req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/login/:path*",
    "/inscription",
    "/:locale/inscription",
    "/admin",
    "/admin/:path*",
    "/teacher",
    "/teacher/:path*",
    "/student",
    "/student/:path*",
  ],
};
