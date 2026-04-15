import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { authCookieOptions } from "@/lib/cookies";

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.redirect(`${origin}/dashboard?checkout=missing-session`);
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);

    if (
      session.mode !== "subscription" ||
      session.payment_status !== "paid" ||
      session.metadata?.plan !== "PREMIUM" ||
      !session.metadata?.userId
    ) {
      return NextResponse.redirect(`${origin}/dashboard?checkout=failed`);
    }

    const userId = Number(session.metadata.userId);

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      include: {
        role: true,
      },
    });

    if (!user) {
      return NextResponse.redirect(`${origin}/dashboard?checkout=user-not-found`);
    }

    const subscription = await prisma.subscription.upsert({
      where: { userId },
      update: { plan: "PREMIUM" },
      create: {
        userId,
        plan: "PREMIUM",
      },
    });

    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role.name,
      plan: subscription.plan,
    });

    const response = NextResponse.redirect(`${origin}/dashboard?checkout=success`);
    response.cookies.set("token", token, authCookieOptions);

    return response;
  } catch {
    return NextResponse.redirect(`${origin}/dashboard?checkout=failed`);
  }
}
