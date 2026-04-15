import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <section className="page-shell grid min-h-[88vh] items-center gap-10 md:grid-cols-[1.05fr_0.95fr]">
        <div>
          <span className="badge bg-emerald-100 text-emerald-800">
            Subscription manga reader
          </span>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="btn btn-primary">
              Create account
            </Link>
            <Link href="/login" className="btn btn-secondary">
              Login
            </Link>
          </div>
        </div>

        <div className="panel overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&w=900&q=80"
            alt="Manga books on a shelf"
            className="h-80 w-full object-cover"
          />
          <div className="grid grid-cols-3 gap-3 p-5 text-center">
            <div>
              <p className="text-2xl font-black text-emerald-800">FREE</p>
              <p className="text-sm text-gray-600">Preview chapters</p>
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-800">PREMIUM</p>
              <p className="text-sm text-gray-600">Full access</p>
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-800">ADMIN</p>
              <p className="text-sm text-gray-600">Manage content</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
