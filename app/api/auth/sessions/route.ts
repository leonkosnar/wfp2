import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAction } from "@/lib/audit";

// GET: List all active sessions for the logged-in user
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const sessions = await prisma.session.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      ipAddress: true,
      userAgent: true,
      createdAt: true,
      // We don't return the secret sessionToken to the frontend
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(sessions);
}

// DELETE: Revoke a specific session
export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { sessionId } = await request.json();

  // Ensure the session belongs to the user trying to delete it
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.userId !== user.id) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  await prisma.session.delete({
    where: { id: sessionId },
  });

      await logAction("TERMINATED SESSION", {
        userId: user.id,
        message: `${user.id} terminated their session ${sessionId}`,
      });

  return NextResponse.json({ success: true });
}
