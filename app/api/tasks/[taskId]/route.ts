import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { taskId } = await params;
  const { assigneeId, title, description, priority } = await request.json();

  const currentTask = await prisma.task.findUnique({
    where: { id: taskId },
  });
  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: { assigneeId, title, description, priority },
  });

  if (currentTask?.assigneeId != assigneeId)
    await prisma.notification.create({
      data: {
        userId: assigneeId,
        message: `${user.id} assigned you to the task ${title} (${taskId})`,
      },
    });

  return NextResponse.json(updatedTask);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  const { taskId } = await params;

  await prisma.task.delete({ where: { id: taskId } });
  return NextResponse.json({ success: true });
}
