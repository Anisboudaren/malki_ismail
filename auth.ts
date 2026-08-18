import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "@/lib/prisma";

/**
 * Auth.js owns the Session table and the session cookie.
 * Email-code login is implemented in `app/actions/auth.ts` because the
 * Credentials provider cannot persist database sessions. After a code is
 * verified we write a Session row and set the same cookie Auth.js reads.
 */
export const { handlers, auth, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database", maxAge: 30 * 24 * 60 * 60 },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role;
      session.user.suspended = user.suspended;
      session.user.avatarUrl = user.avatarUrl ?? user.image;
      session.user.locale = user.locale ?? "fr";
      return session;
    },
  },
});
