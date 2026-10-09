import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

import { getNextUserBusinessId } from "@/lib/id-generator";
import { prisma } from "@/lib/prisma";

async function hasUserBusinessIdColumn() {
  try {
    const rows = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS(
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'users'
          AND column_name = 'userId'
      ) AS "exists";
    `;

    return Boolean(rows[0]?.exists);
  } catch {
    return false;
  }
}

async function getUserProfileSelect() {
  const supportsUserId = await hasUserBusinessIdColumn();

  if (supportsUserId) {
    return {
      id: true,
      userId: true,
      name: true,
      phone: true,
      passwordHash: true,
      role: true,
      isActive: true,
      email: true,
      avatarUrl: true,
      emailVerifiedAt: true,
      phoneVerifiedAt: true,
    } as const;
  }

  return {
    id: true,
    name: true,
    phone: true,
    passwordHash: true,
    role: true,
    isActive: true,
    email: true,
    avatarUrl: true,
    emailVerifiedAt: true,
    phoneVerifiedAt: true,
  } as const;
}

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
    name: "Student",
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
  const defaultPhone = isAdminBootstrap ? "+919000000000" : "+919000000001";

  const supportsUserId = await hasUserBusinessIdColumn();
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: await getUserProfileSelect(),
  });

  const needsPasswordReset = !existingUser?.passwordHash || !(await bcrypt.compare(bootstrapUser.password, existingUser.passwordHash));
  const nextName = existingUser?.name ?? bootstrapUser.name;
  const nextUserId = supportsUserId ? existingUser?.userId ?? (await getNextUserBusinessId(prisma)) : undefined;

  const updateData: Prisma.UserUpdateInput = {
    name: nextName,
    passwordHash: needsPasswordReset ? hash : existingUser?.passwordHash ?? hash,
    role: resolvedRole,
    isActive: true,
    phone: existingUser?.phone ?? defaultPhone,
    emailVerifiedAt: existingUser?.emailVerifiedAt ?? new Date(),
    phoneVerifiedAt: existingUser?.phoneVerifiedAt ?? new Date(),
    ...(supportsUserId && nextUserId ? { userId: existingUser?.userId ?? nextUserId } : {}),
  };

  const createData: Prisma.UserCreateInput = {
    email: normalizedEmail,
    name: bootstrapUser.name,
    passwordHash: hash,
    role: resolvedRole,
    phone: defaultPhone,
    isActive: true,
    emailVerifiedAt: new Date(),
    phoneVerifiedAt: new Date(),
    ...(supportsUserId && nextUserId ? { userId: nextUserId } : {}),
  };

  return prisma.user.upsert({
    where: { email: normalizedEmail },
    update: updateData,
    create: createData,
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
          select: await getUserProfileSelect(),
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
          userId: user.userId ?? undefined,
          name: user.name ?? user.email,
          email: user.email,
          role: user.role,
          image: user.avatarUrl ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.userId = "userId" in user && typeof user.userId === "string" ? user.userId : undefined;
        token.email = "email" in user && typeof user.email === "string" ? user.email : token.email;
        token.role = "role" in user ? String(user.role) : undefined;
        token.name = "name" in user && typeof user.name === "string" ? user.name : token.name;
        token.avatarUrl = "image" in user && typeof user.image === "string" ? user.image : undefined;
      }

      if (trigger === "update" && session && typeof session === "object") {
        const nextUserName = session?.user && "name" in session.user && typeof session.user.name === "string" ? session.user.name : undefined;
        const nextUserEmail = session?.user && "email" in session.user && typeof session.user.email === "string" ? session.user.email : undefined;
        const nextSessionName = "name" in session && typeof session.name === "string" ? session.name : undefined;
        const nextRole = "role" in session && typeof session.role === "string" ? session.role : undefined;
        const nextAvatarUrl = "avatarUrl" in session && typeof session.avatarUrl === "string" ? session.avatarUrl : undefined;
        const nextImage = "image" in session && typeof session.image === "string" ? session.image : undefined;
        const nextUserImage = session?.user && "image" in session.user && typeof session.user.image === "string" ? session.user.image : undefined;

        const mergedName = nextUserName ?? nextSessionName ?? token.name;
        const mergedEmail = nextUserEmail ?? token.email;
        const mergedAvatar = nextAvatarUrl ?? nextImage ?? nextUserImage ?? token.avatarUrl;

        if (mergedName) {
          token.name = mergedName;
        }

        if (mergedEmail) {
          token.email = mergedEmail;
        }

        if (nextRole) {
          token.role = nextRole;
        }

        if (mergedAvatar) {
          token.avatarUrl = mergedAvatar;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const currentUser = token.id
          ? await prisma.user.findUnique({
              where: { id: String(token.id) },
              select: await getUserProfileSelect(),
            })
          : null;

        const resolvedName = currentUser?.name ?? (typeof token.name === "string" && token.name.trim() ? token.name : session.user.name ?? "Student");
        const resolvedEmail = currentUser?.email ?? (typeof token.email === "string" && token.email.trim() ? token.email : session.user.email ?? "");
        const resolvedRole = currentUser?.role ?? (token.role as string | undefined) ?? "STUDENT";
        const resolvedUserId = currentUser && "userId" in currentUser ? currentUser.userId ?? undefined : (typeof token.userId === "string" && token.userId.trim() ? token.userId : undefined);
        const resolvedImage = currentUser?.avatarUrl ?? (typeof token.avatarUrl === "string" && token.avatarUrl.trim() ? token.avatarUrl : (typeof session.user.image === "string" && session.user.image.trim() ? session.user.image : null));

        session.user.id = typeof token.id === "string" ? token.id : session.user.id ?? "";
        session.user.userId = resolvedUserId ?? undefined;
        session.user.email = resolvedEmail;
        session.user.role = resolvedRole;
        session.user.name = resolvedName;
        session.user.image = resolvedImage;
      }
      return session;
    },
  },
});
