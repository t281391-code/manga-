"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import CoverImage from "@/components/CoverImage";

type Manga = {
  id: number;
  title: string;
  description: string;
  coverImage?: string | null;
  _count?: { chapters: number };
};

const emptyForm = {
  title: "",
  description: "",
  coverImage: "",
};

export default function AdminMangasPage() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [resolvingCover, setResolvingCover] = useState(false);

  async function loadMangas() {
    const res = await fetch("/api/manga?limit=50", { cache: "no-store" });
    const data = await res.json();
    if (data.success) {
      setMangas(data.data);
    }
  }

  function startEdit(manga: Manga) {
    setEditingId(manga.id);
    setForm({
      title: manga.title,
      description: manga.description,
      coverImage: manga.coverImage || "",
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const coverImage = await resolveCoverImage(form.coverImage);

    const res = await fetch(editingId ? `/api/manga/${editingId}` : "/api/manga", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        coverImage,
      }),
    });

    const data = await res.json();
    setMessage(data.message || "Done");

    if (data.success) {
      setForm(emptyForm);
      setEditingId(null);
      await loadMangas();
    }
  }

  async function resolveCoverImage(url: string) {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) return "";

    setResolvingCover(true);

    try {
      const res = await fetch("/api/image/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmedUrl }),
      });
      const data = await res.json();

      if (data.success) {
        setForm((current) => ({
          ...current,
          coverImage: data.data.imageUrl,
        }));
        setMessage("Cover image URL resolved");
        return data.data.imageUrl as string;
      }

      setMessage(data.message || "Could not resolve cover image URL");
      return trimmedUrl;
    } catch {
      setMessage("Could not resolve cover image URL");
      return trimmedUrl;
    } finally {
      setResolvingCover(false);
    }
  }

  async function deleteManga(id: number) {
    const res = await fetch(`/api/manga/${id}`, { method: "DELETE" });
    const data = await res.json();
    setMessage(data.message || "Done");
    await loadMangas();
  }

  useEffect(() => {
    loadMangas();
  }, []);

  return (
    <main>
      <Navbar />
      <section className="page-shell">
        <div className="mb-8">
          <span className="badge bg-emerald-100 text-emerald-800">Admin</span>
          <h1 className="mt-4 text-4xl font-black">Manga Management</h1>
          <p className="mt-2 text-gray-600">
            Create manga records and maintain the published library.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form onSubmit={handleSubmit} className="panel p-6">
            <h2 className="text-2xl font-black">
              {editingId ? "Edit Manga" : "Create Manga"}
            </h2>
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-gray-700">
                  Manga title
                </span>
                <input
                  className="field"
                  placeholder="Death Note"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-gray-700">
                  Description
                </span>
                <textarea
                  className="field min-h-32"
                  placeholder="Short manga description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-gray-700">
                  Cover image URL
                </span>
                <input
                  className="field"
                  type="url"
                  placeholder="https://example.com/cover.jpg"
                  value={form.coverImage}
                  onChange={(e) =>
                    setForm({ ...form, coverImage: e.target.value.trim() })
                  }
                  onBlur={() => resolveCoverImage(form.coverImage)}
                />
                <span className="mt-2 block text-xs text-gray-500">
                  Paste a direct image URL, Pinterest pin URL, or another page
                  with a preview image.
                </span>
              </label>
              <div className="overflow-hidden rounded border border-emerald-100 bg-white">
                <CoverImage
                  src={form.coverImage}
                  alt="Cover preview"
                  className="h-56 w-full object-cover"
                />
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 text-sm text-gray-600">
                  <span>Cover preview</span>
                  {form.coverImage && (
                    <a
                      href={form.coverImage}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-emerald-800"
                    >
                      Open URL
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button className="btn btn-primary" disabled={resolvingCover}>
                {resolvingCover
                  ? "Resolving image..."
                  : editingId
                    ? "Save Changes"
                    : "Create Manga"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={!form.coverImage || resolvingCover}
                onClick={() => resolveCoverImage(form.coverImage)}
              >
                Resolve Cover URL
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
            {message && <p className="mt-4 text-sm font-semibold">{message}</p>}
          </form>

          <section className="grid gap-4">
            {mangas.map((manga) => (
              <article key={manga.id} className="panel grid gap-4 overflow-hidden md:grid-cols-[180px_1fr]">
                <CoverImage
                  src={manga.coverImage || "https://placehold.co/500x360?text=Manga"}
                  alt={`${manga.title} cover`}
                  className="h-full min-h-44 w-full object-cover"
                />
                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="text-xl font-black">{manga.title}</h3>
                    <span className="badge bg-gray-100 text-gray-700">
                      {manga._count?.chapters ?? 0} chapters
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {manga.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button className="btn btn-secondary" onClick={() => startEdit(manga)}>
                      Edit
                    </button>
                    <button className="btn btn-danger" onClick={() => deleteManga(manga.id)}>
                      Soft Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </div>
      </section>
    </main>
  );
}
