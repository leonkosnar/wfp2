import { prisma } from "@/lib/prisma";

export async function logAction(
  actionType: string,
  details: { userId?: string, projectId?: string, taskId?: string; message: string },
) {
  try {
    await prisma.activityLog.create({
      data: {
        actionType,
        userId: details.userId,
        projectId: details.projectId,
        taskId: details.taskId,
        entityTitle: details.message,
      },
    });
  } catch (e) {
    console.error(e);
  }
  return;
}
