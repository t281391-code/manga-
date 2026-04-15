import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import CoverImage from "@/components/CoverImage";
import { getSession } from "@/lib/auth";
import { getCachedMangaPage } from "@/lib/manga-data";

function pageHref(page: number) {
  return `/mangas?page=${page}`;
}

export default async function MangaListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const params = await searchParams;
  const page = Math.max(1, Number(params.page || 1));
  const { mangas, pagination } = await getCachedMangaPage(page, 6);

  return (
    <main>
      <Navbar />
      <section className="page-shell">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="badge bg-emerald-100 text-emerald-800">Library</span>
            <h1 className="mt-4 text-4xl font-black">Manga List</h1>
            <p className="mt-2 text-gray-600">
              Open a manga and choose a chapter. Locked chapters require PREMIUM.
            </p>
          </div>
          <p className="text-sm font-semibold text-gray-600">
            {pagination.total} manga found
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {mangas.map((manga) => (
            <article key={manga.id} className="panel overflow-hidden">
              <CoverImage
                src={manga.coverImage || "https://placehold.co/600x420?text=Manga"}
                alt={`${manga.title} cover`}
                className="h-52 w-full object-cover"
              />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-black">{manga.title}</h2>
                  <span className="badge bg-gray-100 text-gray-700">
                    {manga._count?.chapters ?? 0} chapters
                  </span>
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                  {manga.description}
                </p>
                <Link
                  href={`/mangas/${manga.id}`}
                  prefetch
                  className="btn btn-primary mt-5 w-full"
                >
                  Open manga
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {pagination.page <= 1 ? (
            <span className="btn btn-secondary opacity-55">Prev</span>
          ) : (
            <Link
              href={pageHref(pagination.page - 1)}
              prefetch
              className="btn btn-secondary"
            >
              Prev
            </Link>
          )}
          <span className="rounded border border-emerald-100 bg-white px-4 py-2 text-sm font-bold">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          {pagination.page >= pagination.totalPages ? (
            <span className="btn btn-secondary opacity-55">Next</span>
          ) : (
            <Link
              href={pageHref(pagination.page + 1)}
              prefetch
              className="btn btn-secondary"
            >
              Next
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
