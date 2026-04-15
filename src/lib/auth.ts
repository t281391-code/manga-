import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

type SessionPayload = {
  userId: number;
  email: string;
  name?: string;
  role: string;
  plan: string;
};

function getJwtSecret() {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return new TextEncoder().encode(jwtSecret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hashed: string) {
  return bcrypt.compare(password, hashed);
}

export async function signToken(payload: {
  userId: number;
  email: string;
  name?: string;
  role: string;
  plan: string;
}) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecret());
  return payload as SessionPayload;
}

export async function getTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value;
}

export async function getSession() {
  try {
    const token = await getTokenFromCookies();
    if (!token) return null;

    return await verifyToken(token);
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getCurrentUser() {
  try {
    const session = await getSession();
    if (!session) return null;

    const user = await prisma.user.findFirst({
      where: {
        id: session.userId,
        deletedAt: null,
      },
      include: {
        role: true,
        subscription: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role.name !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return user;
}

export function canAccessChapter(
  plan: string,
  isPreview: boolean,
  orderIndex: number
) {
  if (plan === "PREMIUM") return true;
  return isPreview && orderIndex <= 2;
}
