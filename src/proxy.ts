import { NextResponse } from "next/server";

import { auth } from "@/auth";

const protectedPaths = [
  "/dashboard",
  "/profile",
  "/transactions",
  "/my-courses",
];

export async function proxy(request: Request) {
  const session = await auth();
  const url = new URL(request.url);
  const pathname = url.pathname;
  const search = url.search;

  const isProtectedPath =
    protectedPaths.includes(pathname) ||
    pathname.startsWith("/dashboard/") ||
    pathname.startsWith("/profile/") ||
    pathname.startsWith("/transactions/") ||
    pathname.startsWith("/my-courses/");

  const isAdminProtectedPath =
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  const isAuthPage = ["/login", "/signup", "/forgot-password", "/admin/login"].includes(pathname);

  if (!session?.user?.id && isProtectedPath) {
    const callbackUrl = encodeURIComponent(`${pathname}${search}`);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, url.origin));
  }

  if (!session?.user?.id && isAdminProtectedPath && pathname !== "/admin/login") {
    const callbackUrl = encodeURIComponent(`${pathname}${search}`);
    return NextResponse.redirect(new URL(`/admin/login?callbackUrl=${callbackUrl}`, url.origin));
  }

  if (session?.user?.id && pathname === "/admin/login") {
    const adminRole = session.user.role === "ADMIN";
    return NextResponse.redirect(new URL(adminRole ? "/admin" : "/", url.origin));
  }

  if (session?.user?.id && isAdminProtectedPath && pathname !== "/admin/login" && session.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", url.origin));
  }

  if (session?.user?.id && isAuthPage) {
    const callbackUrl = url.searchParams.get("callbackUrl");
    if (callbackUrl) {
      return NextResponse.redirect(new URL(callbackUrl, url.origin));
    }
    return NextResponse.redirect(new URL(session.user.role === "ADMIN" ? "/admin" : "/profile", url.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/transactions/:path*",
    "/my-courses/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/admin/login",
  ],
};
