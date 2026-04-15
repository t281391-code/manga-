import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      id: session.userId,
      name: session.name || session.email,
      email: session.email,
      role: session.role,
      plan: session.plan,
    },
  });
}
