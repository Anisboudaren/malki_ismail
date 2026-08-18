import type { DefaultSession } from "next-auth";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: Role;
      suspended: boolean;
      avatarUrl?: string | null;
      locale: string;
    };
  }

  interface User {
    role: Role;
    suspended: boolean;
    avatarUrl?: string | null;
    locale: string;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    role: Role;
    suspended: boolean;
    avatarUrl?: string | null;
    locale: string;
  }
}
