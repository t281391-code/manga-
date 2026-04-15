"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

type Manga = {
  id: number;
  title: string;
};

type Chapter = {
  id: number;
  mangaId: number;
  title: string;
  content?: string;
  orderIndex: number;
  isPreview: boolean;
};

const emptyForm = {
  mangaId: 0,
  title: "",
  content: "",
  orderIndex: 1,
  isPreview: false,
};

export default function AdminChaptersPage() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function loadMangas() {
    const res = await fetch("/api/manga?limit=50", { cache: "no-store" });
    const data = await res.json();
    if (data.success) {
      setMangas(data.data);
      const firstId = data.data[0]?.id || 0;
      setForm((current) => ({
        ...current,
        mangaId: current.mangaId || firstId,
      }));
    }
  }

  async function loadChapters(mangaId: number) {
    if (!mangaId) return;
    const res = await fetch(`/api/chapters?mangaId=${mangaId}&limit=50`, {
      cache: "no-store",
    });
    const data = await res.json();
    if (data.success) {
      setChapters(data.data);
    }
  }

  async function startEdit(chapterId: number) {
    const res = await fetch(`/api/chapters/${chapterId}`, { cache: "no-store" });
    const data = await res.json();
    if (data.success) {
      setEditingId(chapterId);
      setForm({
        mangaId: data.data.mangaId,
        title: data.data.title,
        content: data.data.content,
        orderIndex: data.data.orderIndex,
        isPreview: data.data.isPreview,
      });
      setMessage("");
    } else {
      setMessage(data.message || "Unable to load chapter.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      mangaId: Number(form.mangaId),
      title: form.title,
      content: form.content,
      orderIndex: Number(form.orderIndex),
      isPreview: Boolean(form.isPreview),
    };

    const res = await fetch(
      editingId ? `/api/chapters/${editingId}` : "/api/chapters",
      {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();
    setMessage(data.message || "Done");

    if (data.success) {
      setEditingId(null);
      setForm({
        ...emptyForm,
        mangaId: payload.mangaId,
        orderIndex: payload.orderIndex + 1,
      });
      await loadChapters(payload.mangaId);
    }
  }

  async function deleteChapter(id: number) {
    const res = await fetch(`/api/chapters/${id}`, { method: "DELETE" });
    const data = await res.json();
    setMessage(data.message || "Done");
    await loadChapters(form.mangaId);
  }

  useEffect(() => {
    loadMangas();
  }, []);

  useEffect(() => {
    loadChapters(form.mangaId);
  }, [form.mangaId]);

  return (
    <main>
      <Navbar showAdmin />
      <section className="page-shell">
        <div className="mb-8">
          <span className="badge bg-emerald-100 text-emerald-800">Admin</span>
          <h1 className="mt-4 text-4xl font-black">Chapter Management</h1>
          <p className="mt-2 text-gray-600">
            Mark preview chapters for FREE users and premium chapters for subscribers.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form onSubmit={handleSubmit} className="panel p-6">
            <h2 className="text-2xl font-black">
              {editingId ? "Edit Chapter" : "Create Chapter"}
            </h2>
            <div className="mt-5 space-y-4">
              <select
                className="field"
                value={form.mangaId}
                onChange={(e) =>
                  setForm({ ...form, mangaId: Number(e.target.value) })
                }
              >
                <option value={0}>Select manga</option>
                {mangas.map((manga) => (
                  <option key={manga.id} value={manga.id}>
                    {manga.title}
                  </option>
                ))}
              </select>
              <input
                className="field"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <textarea
                className="field min-h-40"
                placeholder="Content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
              <input
                className="field"
                placeholder="Order Index"
                type="number"
                value={form.orderIndex}
                onChange={(e) =>
                  setForm({ ...form, orderIndex: Number(e.target.value) })
                }
              />
              <label className="flex items-center gap-3 rounded border border-emerald-100 bg-white p-3 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={form.isPreview}
                  onChange={(e) =>
                    setForm({ ...form, isPreview: e.target.checked })
                  }
                />
                FREE preview chapter
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button className="btn btn-primary" disabled={!form.mangaId}>
                {editingId ? "Save Changes" : "Create Chapter"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditingId(null);
                    setForm({ ...emptyForm, mangaId: form.mangaId });
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
            {message && <p className="mt-4 text-sm font-semibold">{message}</p>}
          </form>

          <section className="panel p-6">
            <h2 className="text-2xl font-black">Chapters</h2>
            <div className="mt-4 grid gap-3">
              {chapters.map((chapter) => (
                <article
                  key={chapter.id}
                  className="rounded border border-emerald-100 bg-white p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-black">
                        {chapter.orderIndex}. {chapter.title}
                      </h3>
                      <span
                        className={`badge mt-2 ${
                          chapter.isPreview
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {chapter.isPreview ? "Preview" : "Premium"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="btn btn-secondary min-h-0 px-3 py-2 text-sm"
                        onClick={() => startEdit(chapter.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger min-h-0 px-3 py-2 text-sm"
                        onClick={() => deleteChapter(chapter.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
              {!chapters.length && (
                <p className="rounded border border-emerald-100 bg-white p-4 text-sm text-gray-600">
                  No chapters found for this manga.
                </p>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
