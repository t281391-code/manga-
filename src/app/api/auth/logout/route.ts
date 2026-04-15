import { NextResponse } from "next/server";
import { authCookieOptions } from "@/lib/cookies";

function wantsJson(req: Request) {
  return req.headers.get("accept")?.includes("application/json") || false;
}

export async function POST(req: Request) {
  const response = wantsJson(req)
    ? NextResponse.json({
        success: true,
        message: "Logged out successfully",
      })
    : NextResponse.redirect(new URL("/login", req.url), 303);

  response.cookies.set("token", "", {
    ...authCookieOptions,
    maxAge: 0,
  });

  return response;
}
