import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireSession();

    return NextResponse.json({
      success: true,
      data: {
        plan: session.plan || "FREE",
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
}
