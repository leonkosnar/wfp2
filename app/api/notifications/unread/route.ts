import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json([], { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: {
      userId: user.id,
      isRead: false,
    },
    orderBy: { createdAt: "desc" },
  });

  console.log(`Found ${notifications.length} unread notifications`);
  return NextResponse.json(notifications);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json([], { status: 401 });

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  if (!query) return NextResponse.json([], { status: 403 });

  await prisma.notification.update({
    where: { id: query },
    data: { isRead: true },
  });
  return NextResponse.json({ success: true });
}
