import { revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const MANGA_CONTENT_TAG = "manga-content";

export const getCachedMangaPage = unstable_cache(
  async (page: number, limit: number) => {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 50);
    const skip = (safePage - 1) * safeLimit;
    const where = { deletedAt: null };

    const [mangas, total] = await Promise.all([
      prisma.manga.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { chapters: true },
          },
        },
      }),
      prisma.manga.count({ where }),
    ]);

    return {
      mangas,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.max(1, Math.ceil(total / safeLimit)),
      },
    };
  },
  ["manga-page"],
  { revalidate: 300, tags: [MANGA_CONTENT_TAG] }
);

export const getCachedMangaDetail = unstable_cache(
  async (id: number) => {
    return prisma.manga.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        chapters: {
          where: { deletedAt: null },
          orderBy: { orderIndex: "asc" },
          select: {
            id: true,
            title: true,
            orderIndex: true,
            isPreview: true,
          },
        },
      },
    });
  },
  ["manga-detail"],
  { revalidate: 300, tags: [MANGA_CONTENT_TAG] }
);

export const getCachedChapterPage = unstable_cache(
  async (mangaId: number, page: number, limit: number) => {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 50);
    const skip = (safePage - 1) * safeLimit;
    const where = {
      mangaId,
      deletedAt: null,
    };

    const [chapters, total] = await Promise.all([
      prisma.chapter.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: { orderIndex: "asc" },
        select: {
          id: true,
          title: true,
          orderIndex: true,
          isPreview: true,
          mangaId: true,
        },
      }),
      prisma.chapter.count({ where }),
    ]);

    return {
      chapters,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.max(1, Math.ceil(total / safeLimit)),
      },
    };
  },
  ["chapter-page"],
  { revalidate: 300, tags: [MANGA_CONTENT_TAG] }
);

export const getCachedChapterDetail = unstable_cache(
  async (id: number) => {
    return prisma.chapter.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        content: true,
        orderIndex: true,
        isPreview: true,
        mangaId: true,
      },
    });
  },
  ["chapter-detail"],
  { revalidate: 300, tags: [MANGA_CONTENT_TAG] }
);

export function refreshMangaContent() {
  revalidateTag(MANGA_CONTENT_TAG, "max");
}
