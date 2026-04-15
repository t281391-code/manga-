import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { authCookieOptions } from "@/lib/cookies";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const rate = checkRateLimit(`login:${ip}`, 5, 60 * 1000);

    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, message: "Too many login attempts" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validated = loginSchema.parse(body);

    const user = await prisma.user.findFirst({
      where: {
        email: validated.email,
        deletedAt: null,
      },
      include: {
        role: true,
        subscription: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const matched = await comparePassword(validated.password, user.password);

    if (!matched) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role.name,
      plan: user.subscription?.plan || "FREE",
    });

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        plan: user.subscription?.plan,
      },
    });

    response.cookies.set("token", token, authCookieOptions);

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Login failed" },
      { status: 500 }
    );
  }
}
