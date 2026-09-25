import { auth } from "@/auth";

export async function proxy(request: Request) {
  return auth(request as any);
}

export const config = {
  matcher: ["/dashboard/:path*", "/courses/:path*"],
};
