import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: { projectId:string, taskId: string } }
) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { taskId } = await params;
  const { newColumnId, newOrder } = await request.json();

  // 1. Get current task details
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: {
        include: { members: true }
      }
    }
  });

  if (!task) return new NextResponse("Task not found", { status: 404 });
  if (!task?.project.members.some(m => m.userId == user.id)) return new NextResponse("Unauthorized", { status: 401 });

  // 2. Transaction to ensure consistency
  try {
    await prisma.$transaction(async (tx) => {
      
      // A. If moving to a DIFFERENT column
      if (task.columnId !== newColumnId) {
        // Shift tasks in OLD column down (close the gap)
        await tx.task.updateMany({
          where: {
            columnId: task.columnId,
            order: { gt: task.order },
          },
          data: { order: { decrement: 1 } },
        });

        // Shift tasks in NEW column up (make space)
        await tx.task.updateMany({
          where: {
            columnId: newColumnId,
            order: { gte: newOrder },
          },
          data: { order: { increment: 1 } },
        });

        // Update the task itself
        await tx.task.update({
          where: { id: taskId },
          data: { columnId: newColumnId, order: newOrder },
        });

        // Log Activity
        await tx.activityLog.create({
          data: {
            userId: user.id,
            projectId: task.projectId,
            taskId: task.id,
            actionType: "MOVE_TASK",
            entityTitle: task.title,
            metadata: JSON.stringify({ from: task.columnId, to: newColumnId }),
          },
        });
      } 
      
      // B. If reordering within the SAME column
      else if (task.order !== newOrder) {
        const isMovingDown = newOrder > task.order;

        if (isMovingDown) {
          await tx.task.updateMany({
            where: {
              columnId: task.columnId,
              order: { gt: task.order, lte: newOrder },
            },
            data: { order: { decrement: 1 } },
          });
        } else {
          // Moving Up
          await tx.task.updateMany({
            where: {
              columnId: task.columnId,
              order: { gte: newOrder, lt: task.order },
            },
            data: { order: { increment: 1 } },
          });
        }

        await tx.task.update({
          where: { id: taskId },
          data: { order: newOrder },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Move failed:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}