"use client";

import { useState } from "react";

export default function DashboardSubscription({
  initialPlan,
  initialMessage,
}: {
  initialPlan: "FREE" | "PREMIUM";
  initialMessage?: string;
}) {
  const [plan, setPlan] = useState(initialPlan);
  const [message, setMessage] = useState(initialMessage || "");
  const [loading, setLoading] = useState(false);

  async function updatePlan(nextPlan: "FREE" | "PREMIUM") {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/subscription/upgrade", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: nextPlan }),
      });
      const data = await res.json();
      setMessage(data.message || "Subscription updated");

      if (data.success) {
        setPlan(nextPlan);
      }
    } catch {
      setMessage("Subscription update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel p-6">
      <h2 className="text-2xl font-black">Subscription</h2>
      <p className="mt-3 text-sm leading-6 text-gray-600">
        FREE can read preview chapters. PREMIUM can read every chapter.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          className="btn btn-secondary"
          disabled={loading || plan === "FREE"}
          onClick={() => updatePlan("FREE")}
        >
          Set FREE
        </button>
        <form method="post" action="/api/subscription/checkout">
          <button
            className="btn btn-primary"
            disabled={loading || plan === "PREMIUM"}
          >
            Pay with Stripe
          </button>
        </form>
      </div>
      {message && (
        <p className="mt-4 text-sm font-semibold text-emerald-800">{message}</p>
      )}
    </section>
  );
}
