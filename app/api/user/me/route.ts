import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Fetch full user data and their active sessions
  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      fullName: true,
      email: true,
      createdAt: true,
      // We exclude the password for security
      sessions: {
        select: {
          id: true,
          userAgent: true,
          ipAddress: true,
          createdAt: true,
          expiresAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!userData) {
    return new NextResponse("User not found", { status: 404 });
  }

  // Separate the data into user profile and sessions for the frontend Tabs
  return NextResponse.json({
    user: {
      id: userData.id,
      fullName: userData.fullName,
      email: userData.email,
      createdAt: userData.createdAt,
    },
    sessions: userData.sessions,
  });
}