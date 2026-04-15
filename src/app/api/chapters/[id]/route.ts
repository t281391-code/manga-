import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { canAccessChapter, requireAdmin, requireSession } from "@/lib/auth";
import { getCachedChapterDetail, refreshMangaContent } from "@/lib/manga-data";

const updateChapterSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  orderIndex: z.number().int().positive(),
  isPreview: z.boolean(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const { id } = await params;

    const chapter = await getCachedChapterDetail(Number(id));

    if (!chapter) {
      return NextResponse.json(
        { success: false, message: "Chapter not found" },
        { status: 404 }
      );
    }

    const role = session.role;
    const plan = session.plan || "FREE";

    if (
      role !== "ADMIN" &&
      !canAccessChapter(plan, chapter.isPreview, chapter.orderIndex)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Upgrade to PREMIUM to access this chapter",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: chapter,
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
    const validated = updateChapterSchema.parse(body);

    const chapter = await prisma.chapter.update({
      where: { id: Number(id) },
      data: validated,
    });

    refreshMangaContent();

    return NextResponse.json({
      success: true,
      message: "Chapter updated",
      data: chapter,
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

    await prisma.chapter.update({
      where: { id: Number(id) },
      data: { deletedAt: new Date() },
    });

    refreshMangaContent();

    return NextResponse.json({
      success: true,
      message: "Chapter soft deleted",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Forbidden or failed" },
      { status: 403 }
    );
  }
}
