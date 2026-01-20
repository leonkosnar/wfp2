import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request, { params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  
  const { content } = await request.json();

  const comment = await prisma.comment.create({
    data: {
      content,
      taskId,
      userId: user!.id,
    },
    include: { user: true }
  });

  return NextResponse.json(comment);
}