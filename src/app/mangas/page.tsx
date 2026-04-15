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

  async function fetchMangas(currentPage: number) {
    setMessage("");
    const res = await fetch(`/api/manga?page=${currentPage}&limit=6`);
    const data = await res.json();

    if (data.success) {
      setMangas(data.data);
      setPagination(data.pagination);
    } else {
      setMessage(data.message || "Unable to load manga.");
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
                <Link href={`/mangas/${manga.id}`} className="btn btn-primary mt-5 w-full">
                  Open manga
                </Link>
              </div>
            </article>
          ))}
        </div>

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
