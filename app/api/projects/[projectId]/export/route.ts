import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } },
) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { projectId } = await params;

  const tasks = await prisma.task.findMany({
    where: {
      projectId: params.projectId,
      project: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
    },
    include: { column: true, assignee: true },
  });

  await logAction("PROJECT EXPORTED", {
    userId: user.id,
    message: `${user.id} exported the project ${projectId}`,
    projectId,
  });

  const headers = "ID,Title,Status,Assignee,Priority\n";
  const rows = tasks
    .map(
      (t) =>
        `${t.id},"${t.title}",${t.column.title},${t.assignee?.fullName || "Unassigned"},${t.priority}`,
    )
    .join("\n");

  return new NextResponse(headers + rows, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=project-${projectId}-tasks.csv`,
    },
  });
}
