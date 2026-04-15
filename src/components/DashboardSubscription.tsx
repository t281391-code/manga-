export default function DashboardSubscription({
  plan,
  message,
}: {
  plan: "FREE" | "PREMIUM";
  message?: string;
}) {
  return (
    <section className="panel p-6">
      <h2 className="text-2xl font-black">Subscription</h2>
      <p className="mt-3 text-sm leading-6 text-gray-600">
        Preview chapters are available on FREE. Full chapter access is available
        on PREMIUM.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <form method="post" action="/api/subscription/upgrade">
          <input type="hidden" name="plan" value="FREE" />
          <button className="btn btn-secondary" disabled={plan === "FREE"}>
            Set FREE
          </button>
        </form>
        <form method="post" action="/api/subscription/checkout">
          <button className="btn btn-primary" disabled={plan === "PREMIUM"}>
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
