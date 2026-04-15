import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const pathname = req.nextUrl.pathname;

  const protectedPaths = ["/dashboard", "/mangas", "/admin"];
  const needsAuth = protectedPaths.some((path) => pathname.startsWith(path));

  if (needsAuth && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/mangas/:path*", "/admin/:path*"],
};
