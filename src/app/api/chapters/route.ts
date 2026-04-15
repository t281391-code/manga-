import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getPagination } from "@/lib/utils";
import { canAccessChapter, requireAdmin, requireSession } from "@/lib/auth";

const createChapterSchema = z.object({
  mangaId: z.number(),
  title: z.string().min(1),
  content: z.string().min(1),
  orderIndex: z.number().int().positive(),
  isPreview: z.boolean().default(false),
});

export async function GET(req: Request) {
  try {
    const session = await requireSession();

    const { searchParams } = new URL(req.url);
    const mangaId = Number(searchParams.get("mangaId"));
    const { page, limit, skip } = getPagination(searchParams);
    const role = session.role;
    const plan = session.plan || "FREE";

    if (!mangaId) {
      return NextResponse.json(
        { success: false, message: "mangaId is required" },
        { status: 400 }
      );
    }

    const where = {
      mangaId,
      deletedAt: null,
    };

    const [chapters, total] = await Promise.all([
      prisma.chapter.findMany({
        where,
        skip,
        take: limit,
        orderBy: { orderIndex: "asc" },
        select: {
          id: true,
          title: true,
          orderIndex: true,
          isPreview: true,
          mangaId: true,
        },
      }),
      prisma.chapter.count({
        where,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: chapters.map((chapter) => ({
        ...chapter,
        canRead:
          role === "ADMIN" ||
          canAccessChapter(plan, chapter.isPreview, chapter.orderIndex),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
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
    const validated = createChapterSchema.parse(body);

    const chapter = await prisma.chapter.create({
      data: validated,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Chapter created",
        data: chapter,
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
