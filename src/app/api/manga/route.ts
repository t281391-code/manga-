import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getPagination } from "@/lib/utils";
import { requireAdmin, requireSession } from "@/lib/auth";
import { normalizeCoverImageUrl } from "@/lib/cover-image";
import { getCachedMangaPage, refreshMangaContent } from "@/lib/manga-data";

const createMangaSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  coverImage: z.string().url().optional().or(z.literal("")),
});

export async function GET(req: Request) {
  try {
    await requireSession();

    const { searchParams } = new URL(req.url);
    const { page, limit } = getPagination(searchParams);

    const { mangas, pagination } = await getCachedMangaPage(page, limit);

    return NextResponse.json({
      success: true,
      data: mangas,
      pagination,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();
    const validated = createMangaSchema.parse(body);
    const coverImage = await normalizeCoverImageUrl(validated.coverImage);

    const manga = await prisma.manga.create({
      data: {
        title: validated.title,
        description: validated.description,
        coverImage,
      },
    });

    refreshMangaContent();

    return NextResponse.json(
      {
        success: true,
        message: "Manga created",
        data: manga,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Forbidden or failed" },
      { status: 403 }
    );
  }
}
