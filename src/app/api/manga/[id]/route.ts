import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { canAccessChapter, requireAdmin, requireAuth } from "@/lib/auth";
import { normalizeCoverImageUrl } from "@/lib/cover-image";

const updateMangaSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  coverImage: z.string().url().optional().or(z.literal("")),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const manga = await prisma.manga.findFirst({
      where: {
        id: Number(id),
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

    if (!manga) {
      return NextResponse.json(
        { success: false, message: "Manga not found" },
        { status: 404 }
      );
    }

    const role = user.role.name;
    const plan = user.subscription?.plan || "FREE";

    return NextResponse.json({
      success: true,
      data: {
        ...manga,
        chapters: manga.chapters.map((chapter) => ({
          ...chapter,
          canRead:
            role === "ADMIN" ||
            canAccessChapter(plan, chapter.isPreview, chapter.orderIndex),
        })),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const validated = updateMangaSchema.parse(body);
    const coverImage = await normalizeCoverImageUrl(validated.coverImage);

    const manga = await prisma.manga.update({
      where: { id: Number(id) },
      data: {
        title: validated.title,
        description: validated.description,
        coverImage,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Manga updated",
      data: manga,
    });
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

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.manga.update({
      where: { id: Number(id) },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: "Manga soft deleted",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Forbidden or failed" },
      { status: 403 }
    );
  }
}
