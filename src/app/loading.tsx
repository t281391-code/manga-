export default function Loading() {
  return (
    <main>
      <div className="border-b border-emerald-100 bg-white/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="h-6 w-24 animate-pulse rounded bg-emerald-100" />
          <div className="hidden gap-3 sm:flex">
            <div className="h-8 w-24 animate-pulse rounded bg-emerald-50" />
            <div className="h-8 w-20 animate-pulse rounded bg-emerald-50" />
            <div className="h-8 w-20 animate-pulse rounded bg-emerald-50" />
          </div>
        </div>
      </div>
      <section className="page-shell">
        <div className="h-6 w-24 animate-pulse rounded-full bg-emerald-100" />
        <div className="mt-4 h-10 w-72 max-w-full animate-pulse rounded bg-gray-100" />
        <div className="mt-3 h-5 w-full max-w-xl animate-pulse rounded bg-gray-100" />
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="panel overflow-hidden">
              <div className="h-52 animate-pulse bg-emerald-50" />
              <div className="space-y-4 p-5">
                <div className="h-6 w-2/3 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-gray-100" />
                <div className="h-10 w-full animate-pulse rounded bg-emerald-100" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
