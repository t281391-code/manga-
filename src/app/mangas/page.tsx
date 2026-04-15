"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import CoverImage from "@/components/CoverImage";

type Manga = {
  id: number;
  title: string;
  description: string;
  coverImage?: string | null;
  _count?: { chapters: number };
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function MangaListPage() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function fetchMangas(currentPage: number) {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/manga?page=${currentPage}&limit=6`);
      const data = await res.json();

      if (data.success) {
        setMangas(data.data);
        setPagination(data.pagination);
      } else {
        setMessage(data.message || "Unable to load manga.");
      }
    } catch {
      setMessage("Unable to load manga.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMangas(page);
  }, [page]);

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
          {pagination && (
            <p className="text-sm font-semibold text-gray-600">
              {pagination.total} manga found
            </p>
          )}
        </div>

        {message && <div className="panel p-5 text-red-700">{message}</div>}

        {loading && !mangas.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
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
        ) : (
        <div className={`grid gap-5 md:grid-cols-2 lg:grid-cols-3 ${loading ? "opacity-60" : ""}`}>
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
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="btn btn-secondary"
          >
            Prev
          </button>
          <span className="rounded border border-emerald-100 bg-white px-4 py-2 text-sm font-bold">
            Page {page} of {pagination?.totalPages || 1}
          </span>
          <button
            onClick={() =>
              setPage((p) => Math.min(pagination?.totalPages || p + 1, p + 1))
            }
            disabled={pagination ? page >= pagination.totalPages : false}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      </section>
    </main>
  );
}
