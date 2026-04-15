"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

type Me = {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  plan?: "FREE" | "PREMIUM";
};

export default function DashboardPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadMe() {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    const data = await res.json();
    setMe(data.success ? data.data : null);
    setLoading(false);
  }

  async function updatePlan(plan: "FREE" | "PREMIUM") {
    setMessage("");

    if (plan === "PREMIUM") {
      const res = await fetch("/api/subscription/checkout", {
        method: "POST",
      });
      const data = await res.json();

      if (data.success && data.data?.url) {
        window.location.href = data.data.url;
        return;
      }

      setMessage(data.message || "Unable to start Stripe Checkout");
      return;
    }

    const res = await fetch("/api/subscription/upgrade", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    setMessage(data.message || "Subscription updated");
    await loadMe();
  }

  useEffect(() => {
    loadMe();
    const checkout = new URLSearchParams(window.location.search).get("checkout");

    if (checkout === "success") {
      setMessage("Payment confirmed. PREMIUM is active.");
    }

    if (checkout === "cancelled") {
      setMessage("Stripe Checkout was cancelled.");
    }

    if (checkout === "failed") {
      setMessage("Stripe Checkout could not be verified.");
    }
  }, []);

  return (
    <main>
      <Navbar />
      <section className="page-shell">
        <div className="mb-8">
          <span className="badge bg-emerald-100 text-emerald-800">Account</span>
          <h1 className="mt-4 text-4xl font-black">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-gray-600">
            Your role controls management access. Your plan controls chapter
            reading access.
          </p>
        </div>

        {loading ? (
          <div className="panel p-6">Loading profile...</div>
        ) : me ? (
          <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
            <section className="panel p-6">
              <h2 className="text-2xl font-black">Profile</h2>
              <div className="mt-5 grid gap-3 text-sm">
                <p>
                  <strong>Name:</strong> {me.name}
                </p>
                <p>
                  <strong>Email:</strong> {me.email}
                </p>
                <p>
                  <strong>Role:</strong>{" "}
                  <span className="badge bg-gray-100 text-gray-800">{me.role}</span>
                </p>
                <p>
                  <strong>Plan:</strong>{" "}
                  <span className="badge bg-emerald-100 text-emerald-800">
                    {me.plan || "FREE"}
                  </span>
                </p>
              </div>
            </section>

            <section className="panel p-6">
              <h2 className="text-2xl font-black">Subscription</h2>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                FREE can read preview chapters. PREMIUM can read every chapter.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  className="btn btn-secondary"
                  disabled={(me.plan || "FREE") === "FREE"}
                  onClick={() => updatePlan("FREE")}
                >
                  Set FREE
                </button>
                <button
                  className="btn btn-primary"
                  disabled={me.plan === "PREMIUM"}
                  onClick={() => updatePlan("PREMIUM")}
                >
                  Pay with Stripe
                </button>
              </div>
              {message && (
                <p className="mt-4 text-sm font-semibold text-emerald-800">
                  {message}
                </p>
              )}
            </section>
          </div>
        ) : (
          <div className="panel p-6">Unable to load profile.</div>
        )}
      </section>
    </main>
  );
}
