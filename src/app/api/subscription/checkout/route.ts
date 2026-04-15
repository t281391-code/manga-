import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

function getOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (origin) return origin;

  const host = req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "http";

  return host ? `${proto}://${host}` : "http://localhost:3001";
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();

    if (user.subscription?.plan === "PREMIUM") {
      return NextResponse.json({
        success: true,
        message: "Already on PREMIUM",
        data: { url: "/dashboard" },
      });
    }

    const origin = getOrigin(req);
    const priceId = process.env.STRIPE_PREMIUM_PRICE_ID;
    const currency = process.env.STRIPE_CURRENCY || "usd";
    const amount = Number(process.env.STRIPE_PREMIUM_AMOUNT || "999");

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,
      client_reference_id: String(user.id),
      metadata: {
        userId: String(user.id),
        plan: "PREMIUM",
      },
      subscription_data: {
        metadata: {
          userId: String(user.id),
          plan: "PREMIUM",
        },
      },
      line_items: [
        priceId
          ? {
              price: priceId,
              quantity: 1,
            }
          : {
              price_data: {
                currency,
                product_data: {
                  name: "Manga Premium",
                },
                recurring: {
                  interval: "month",
                },
                unit_amount: amount,
              },
              quantity: 1,
            },
      ],
      success_url: `${origin}/api/subscription/checkout/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard?checkout=cancelled`,
    });

    return NextResponse.json({
      success: true,
      data: {
        url: session.url,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Could not create Stripe checkout session" },
      { status: 500 }
    );
  }
}
