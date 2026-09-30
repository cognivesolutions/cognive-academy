import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "development-auth-secret";

const BOOTSTRAP_USERS = {
  admin: {
    email: "admin@cognive.academy",
    name: "Admin",
    role: "ADMIN",
    password: "password123",
  },
  student: {
    email: "student@cognive.academy",
    name: "Vishwajeet Singh",
    role: "STUDENT",
    password: "password123",
  },
} as const;

async function ensureBootstrapUser(email: string, requestedRole?: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const bootstrapUser = Object.values(BOOTSTRAP_USERS).find((user) => user.email === normalizedEmail);

  if (!bootstrapUser) {
    return null;
  }

  const hash = await bcrypt.hash(bootstrapUser.password, 10);
  const resolvedRole = requestedRole?.toUpperCase() === "ADMIN" ? "ADMIN" : bootstrapUser.role;

  return prisma.user.upsert({
    where: { email: normalizedEmail },
    update: {
      name: bootstrapUser.name,
      passwordHash: hash,
      role: resolvedRole,
    },
    create: {
      email: normalizedEmail,
      name: bootstrapUser.name,
      passwordHash: hash,
      role: resolvedRole,
    },
  });
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: authSecret,
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials.email as string | undefined;
        const password = credentials.password as string | undefined;
        const requestedRole = (credentials.role as string | undefined)?.toUpperCase();

        if (!email || !password) {
          return null;
        }

        const normalizedEmail = email.trim().toLowerCase();
        let user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user) {
          user = await ensureBootstrapUser(normalizedEmail, requestedRole ?? undefined);
        }

        if (!user || !user.passwordHash) {
          return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);

        if (!valid) {
          return null;
        }

        if (requestedRole === "ADMIN" && user.role?.toUpperCase?.() !== "ADMIN") {
          return null;
        }

        return {
          id: user.id,
          name: user.name ?? user.email,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = "role" in user ? String(user.role) : undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string | undefined) ?? "STUDENT";
      }
      return session;
    },
  },
});
