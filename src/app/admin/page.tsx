import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function AdminPage() {
  return (
    <main>
      <Navbar showAdmin />
      <section className="page-shell">
        <span className="badge bg-emerald-100 text-emerald-800">Admin only</span>
        <h1 className="mt-4 text-4xl font-black">Admin Panel</h1>
        <p className="mt-2 max-w-2xl text-gray-600">
          Publish manga, create chapters, edit records, and soft delete content.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Link
            href="/admin/mangas"
            prefetch
            className="panel block p-6 hover:border-emerald-500"
          >
            <h2 className="text-2xl font-black">Manage Mangas</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Create, edit, and soft delete manga records.
            </p>
          </Link>
          <Link
            href="/admin/chapters"
            prefetch
            className="panel block p-6 hover:border-emerald-500"
          >
            <h2 className="text-2xl font-black">Manage Chapters</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Add preview and premium chapters for each manga.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
