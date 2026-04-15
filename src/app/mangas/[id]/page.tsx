import { notFound, redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import MangaReader from "@/components/MangaReader";
import { canAccessChapter, getSession } from "@/lib/auth";
import { getCachedMangaDetail } from "@/lib/manga-data";

export default async function MangaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const manga = await getCachedMangaDetail(Number(id));

  if (!manga) {
    notFound();
  }

  const plan = session.plan || "FREE";
  const role = session.role;

  return (
    <main>
      <Navbar showAdmin={session.role === "ADMIN"} />
      <section className="page-shell">
        <MangaReader
          manga={{
            id: manga.id,
            title: manga.title,
            description: manga.description,
            coverImage: manga.coverImage,
            chapters: manga.chapters.map((chapter) => ({
              ...chapter,
              canRead:
                role === "ADMIN" ||
                canAccessChapter(plan, chapter.isPreview, chapter.orderIndex),
            })),
          }}
        />
      </section>
    </main>
  );
}
