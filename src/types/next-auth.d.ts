import "next-auth";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      userId?: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    userId?: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    userId?: string;
    role?: string;
  }
}
