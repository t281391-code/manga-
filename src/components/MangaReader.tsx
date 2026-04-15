"use client";

import { useState } from "react";
import CoverImage from "@/components/CoverImage";

type ChapterSummary = {
  id: number;
  title: string;
  orderIndex: number;
  isPreview: boolean;
  canRead?: boolean;
};

type MangaDetail = {
  id: number;
  title: string;
  description: string;
  coverImage?: string | null;
  chapters: ChapterSummary[];
};

type ChapterDetail = ChapterSummary & {
  content: string;
  mangaId: number;
};

export default function MangaReader({ manga }: { manga: MangaDetail }) {
  const [chapter, setChapter] = useState<ChapterDetail | null>(null);
  const [message, setMessage] = useState("");
  const [loadingChapterId, setLoadingChapterId] = useState<number | null>(null);

  async function openChapter(chapterId: number) {
    setMessage("");
    setChapter(null);
    setLoadingChapterId(chapterId);

    try {
      const res = await fetch(`/api/chapters/${chapterId}`, { cache: "no-store" });
      const data = await res.json();

      if (data.success) {
        setChapter(data.data);
      } else {
        setMessage(data.message || "Unable to open chapter.");
      }
    } catch {
      setMessage("Unable to open chapter.");
    } finally {
      setLoadingChapterId(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <aside className="panel overflow-hidden">
        <CoverImage
          src={manga.coverImage || "https://placehold.co/720x520?text=Manga"}
          alt={`${manga.title} cover`}
          className="h-72 w-full object-cover"
        />
        <div className="p-6">
          <span className="badge bg-emerald-100 text-emerald-800">
            {manga.chapters.length} chapters
          </span>
          <h1 className="mt-4 text-3xl font-black">{manga.title}</h1>
          <p className="mt-3 leading-7 text-gray-600">{manga.description}</p>
        </div>
      </aside>

      <div className="grid gap-5">
        <section className="panel p-5">
          <h2 className="text-2xl font-black">Chapters</h2>
          <div className="mt-4 grid gap-3">
            {manga.chapters.map((item) => (
              <button
                key={item.id}
                onClick={() => openChapter(item.id)}
                disabled={loadingChapterId === item.id}
                className="flex items-center justify-between rounded border border-emerald-100 bg-white p-4 text-left hover:border-emerald-500"
              >
                <span>
                  <strong>
                    {item.orderIndex}. {item.title}
                  </strong>
                  <span className="mt-1 block text-sm text-gray-600">
                    {item.isPreview ? "Preview chapter" : "Premium chapter"}
                  </span>
                </span>
                <span
                  className={`badge ${
                    item.canRead
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {loadingChapterId === item.id
                    ? "Opening"
                    : item.canRead
                      ? "Read"
                      : "Locked"}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel min-h-72 p-6">
          <h2 className="text-2xl font-black">Reader</h2>
          {message && (
            <p className="mt-4 rounded border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {message}
            </p>
          )}
          {chapter ? (
            <article className="mt-5">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-black">
                  {chapter.orderIndex}. {chapter.title}
                </h3>
                <span className="badge bg-emerald-100 text-emerald-800">
                  {chapter.isPreview ? "Preview" : "Premium"}
                </span>
              </div>
              <p className="whitespace-pre-wrap leading-8 text-gray-700">
                {chapter.content}
              </p>
            </article>
          ) : (
            <p className="mt-5 text-gray-600">Select a chapter to start reading.</p>
          )}
        </section>
      </div>
    </div>
  );
}
