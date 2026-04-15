import { NextResponse } from "next/server";
import { authCookieOptions } from "@/lib/cookies";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  response.cookies.set("token", "", {
    ...authCookieOptions,
    maxAge: 0,
  });

  return response;
}
