import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const body = await request.json();
  const { title, projectId, columnId, assigneeId, priority, description } = body;

  // 1. Find the new order position (last in column)
  const lastTask = await prisma.task.findFirst({
    where: { columnId },
    orderBy: { order: "desc" },
  });
  const newOrder = (lastTask?.order ?? 0) + 1;

  // 2. Create Task
  const task = await prisma.task.create({
    data: {
      title,
      projectId,
      columnId,
      assigneeId,
      priority,
      description,
      order: newOrder,
    },
  });

  return NextResponse.json(task);
}