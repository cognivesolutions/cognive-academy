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

let bootstrapRepairPromise: Promise<void> | null = null;

async function ensureBootstrapUser(email: string, requestedRole?: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const bootstrapUser = Object.values(BOOTSTRAP_USERS).find((user) => user.email === normalizedEmail);

  if (!bootstrapUser) {
    return null;
  }

  const hash = await bcrypt.hash(bootstrapUser.password, 10);
  const resolvedRole = requestedRole?.toUpperCase() === "ADMIN" ? "ADMIN" : bootstrapUser.role;
  const isAdminBootstrap = resolvedRole === "ADMIN";

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      passwordHash: true,
      role: true,
      isActive: true,
      emailVerifiedAt: true,
      phoneVerifiedAt: true,
    },
  });

  const needsPasswordReset = !existingUser?.passwordHash || !(await bcrypt.compare(bootstrapUser.password, existingUser.passwordHash));

  return prisma.user.upsert({
    where: { email: normalizedEmail },
    update: {
      name: bootstrapUser.name,
      passwordHash: needsPasswordReset ? hash : existingUser?.passwordHash ?? hash,
      role: resolvedRole,
      isActive: true,
      phone: isAdminBootstrap ? "+919000000000" : undefined,
      emailVerifiedAt: isAdminBootstrap ? new Date() : undefined,
      phoneVerifiedAt: isAdminBootstrap ? new Date() : undefined,
    },
    create: {
      email: normalizedEmail,
      name: bootstrapUser.name,
      passwordHash: hash,
      role: resolvedRole,
      phone: isAdminBootstrap ? "+919000000000" : null,
      isActive: isAdminBootstrap ? true : false,
      emailVerifiedAt: isAdminBootstrap ? new Date() : null,
      phoneVerifiedAt: isAdminBootstrap ? new Date() : null,
    },
  });
}

export async function ensureBootstrapUsers() {
  if (bootstrapRepairPromise) {
    return bootstrapRepairPromise;
  }

  bootstrapRepairPromise = (async () => {
    try {
      for (const bootstrapUser of Object.values(BOOTSTRAP_USERS)) {
        await ensureBootstrapUser(bootstrapUser.email, bootstrapUser.role);
      }
    } catch (error) {
      console.error("Bootstrap user repair failed:", error);
      throw error;
    }
  })();

  try {
    await bootstrapRepairPromise;
  } catch {
    bootstrapRepairPromise = null;
    return;
  }

  return bootstrapRepairPromise;
}

void ensureBootstrapUsers().catch(() => undefined);

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
        await ensureBootstrapUsers();
        const bootstrapUserMatch = Object.values(BOOTSTRAP_USERS).find((user) => user.email === normalizedEmail);
        let user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (bootstrapUserMatch) {
          user = await ensureBootstrapUser(normalizedEmail, requestedRole ?? undefined);
        }

        if (!user || !user.passwordHash) {
          return null;
        }

        const isInternalAdmin = user.role?.toUpperCase?.() === "ADMIN";

        if (user.isActive === false) {
          throw new Error("AccountInactive");
        }

        if (!isInternalAdmin && (!user.emailVerifiedAt || !user.phoneVerifiedAt)) {
          throw new Error("VerificationRequired");
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
