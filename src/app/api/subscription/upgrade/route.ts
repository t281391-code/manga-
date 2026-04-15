import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, signToken } from "@/lib/auth";
import { authCookieOptions } from "@/lib/cookies";

const upgradeSchema = z.object({
  plan: z.enum(["FREE", "PREMIUM"]),
});

async function setSubscriptionPlan(plan: "FREE" | "PREMIUM") {
  const user = await requireAuth();

  const subscription = await prisma.subscription.update({
    where: { userId: user.id },
    data: { plan },
  });

  const token = await signToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role.name,
    plan: subscription.plan,
  });

  return { subscription, token };
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const plan = formData.get("plan");

    if (plan !== "FREE") {
      return NextResponse.redirect(new URL("/dashboard?checkout=failed", req.url), 303);
    }

    const { token } = await setSubscriptionPlan(plan);
    const response = NextResponse.redirect(new URL("/dashboard", req.url), 303);
    response.cookies.set("token", token, authCookieOptions);

    return response;
  } catch {
    return NextResponse.redirect(new URL("/dashboard?checkout=failed", req.url), 303);
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const validated = upgradeSchema.parse(body);

    if (validated.plan === "PREMIUM") {
      return NextResponse.json(
        {
          success: false,
          message: "Use Stripe Checkout to upgrade to PREMIUM",
        },
        { status: 400 }
      );
    }

    const { subscription, token } = await setSubscriptionPlan(validated.plan);

    const response = NextResponse.json({
      success: true,
      message: "Subscription updated",
      data: subscription,
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
      { success: false, message: "Upgrade failed" },
      { status: 500 }
    );
  }
}
