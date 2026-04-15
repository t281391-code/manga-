import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  stripe ??= new Stripe(stripeSecretKey);

  return stripe;
}
