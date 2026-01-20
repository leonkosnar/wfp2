// lib/auth.ts
import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "jira_session_id";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

// --- Password Helpers ---

export async function hashPassword(password: string) {
  return await hash(password, 12);
}

export async function verifyPassword(plain: string, hashed: string) {
  return await compare(plain, hashed);
}

// --- Session Management ---

export async function createSession(userId: string, req?: Request) {
  const cookieStore = await cookies();
  // 1. Generate a session ID (Database handles the UUID generation, but we return the record)
  // We capture User Agent and IP if strictly needed, but for now we focus on the core flow.

  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  const session = await prisma.session.create({
    data: {
      userId,
      expiresAt,
      sessionToken: crypto.randomUUID(), // Explicitly generating token
      userAgent: req?.headers.get("user-agent") || "Unknown",
      ipAddress: "127.0.0.1", // In prod, parse 'x-forwarded-for' header
    },
  });

  // 2. Set the Cookie
  cookieStore.set(SESSION_COOKIE_NAME, session.sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return session;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();

  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) return null;

  // 1. Look up session in DB
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true },
  });

  // 2. Validate Session
  if (!session) return null;

  if (new Date() > session.expiresAt) {
    // Session expired - cleanup
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }

  // 3. Return User (excluding password)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...userWithoutPassword } = session.user;
  return userWithoutPassword;
}

export async function logout() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionToken) {
    await prisma.session
      .delete({
        where: { sessionToken },
      })
      .catch(() => {}); // Ignore if already deleted
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}
