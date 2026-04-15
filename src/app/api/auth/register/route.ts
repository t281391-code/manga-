import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { authCookieOptions } from "@/lib/cookies";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Email already exists" },
        { status: 400 }
      );
    }

    const userRole = await prisma.role.upsert({
      where: { name: "USER" },
      update: {},
      create: { name: "USER" },
    });

    const hashed = await hashPassword(validated.password);

    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashed,
        roleId: userRole.id,
        subscription: {
          create: {
            plan: "FREE",
          },
        },
      },
      include: {
        role: true,
        subscription: true,
      },
    });

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role.name,
      plan: user.subscription?.plan || "FREE",
    });

    const response = NextResponse.json({
      success: true,
      message: "Registered successfully",
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
      { success: false, message: "Register failed" },
      { status: 500 }
    );
  }
}
