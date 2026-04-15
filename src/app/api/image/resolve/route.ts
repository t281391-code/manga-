import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { isDirectImageUrl, normalizeCoverImageUrl } from "@/lib/cover-image";

const resolveImageSchema = z.object({
  url: z.string().url(),
});

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { url } = resolveImageSchema.parse(body);
    const imageUrl = await normalizeCoverImageUrl(url);

    if (!imageUrl || !isDirectImageUrl(imageUrl)) {
      return NextResponse.json(
        {
          success: false,
          message: "Could not find a direct image URL from this link",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        imageUrl,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0]?.message || "Invalid URL" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Unable to resolve image URL" },
      { status: 500 }
    );
  }
}
