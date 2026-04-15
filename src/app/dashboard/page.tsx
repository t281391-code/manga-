import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import DashboardSubscription from "@/components/DashboardSubscription";
import { getSession } from "@/lib/auth";

function getCheckoutMessage(checkout?: string) {
  if (checkout === "success") return "Payment confirmed. PREMIUM is active.";
  if (checkout === "cancelled") return "Stripe Checkout was cancelled.";
  if (checkout === "failed") return "Stripe Checkout could not be verified.";
  return "";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const params = await searchParams;
  const plan = session.plan === "PREMIUM" ? "PREMIUM" : "FREE";

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

        <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <section className="panel p-6">
            <h2 className="text-2xl font-black">Profile</h2>
            <div className="mt-5 grid gap-3 text-sm">
              <p>
                <strong>Name:</strong> {session.name || session.email}
              </p>
              <p>
                <strong>Email:</strong> {session.email}
              </p>
              <p>
                <strong>Role:</strong>{" "}
                <span className="badge bg-gray-100 text-gray-800">
                  {session.role}
                </span>
              </p>
              <p>
                <strong>Plan:</strong>{" "}
                <span className="badge bg-emerald-100 text-emerald-800">
                  {plan}
                </span>
              </p>
            </div>
          </section>

          <DashboardSubscription
            initialPlan={plan}
            initialMessage={getCheckoutMessage(params.checkout)}
          />
        </div>
      </section>
    </main>
  );
}
