import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function getJwtSecret() {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return new TextEncoder().encode(jwtSecret);
}

async function verifyRole(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecret());
  return typeof payload.role === "string" ? payload.role : null;
}

export async function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const pathname = req.nextUrl.pathname;
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const host = req.headers.get("host") || "";

  if (
    process.env.NODE_ENV === "production" &&
    forwardedProto === "http" &&
    !host.startsWith("localhost") &&
    !host.startsWith("127.0.0.1")
  ) {
    const httpsUrl = req.nextUrl.clone();
    httpsUrl.protocol = "https:";
    return NextResponse.redirect(httpsUrl, 308);
  }

  const protectedPaths = ["/dashboard", "/mangas", "/admin"];
  const needsAuth = protectedPaths.some((path) => pathname.startsWith(path));

  if (needsAuth && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (needsAuth && token) {
    try {
      const role = await verifyRole(token);

      if (pathname.startsWith("/admin") && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    } catch {
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.set("token", "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
      });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
