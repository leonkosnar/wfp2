import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Assuming you have a singleton prisma client
import { getCurrentUser } from "@/lib/auth"; // Your manual auth helper

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } },
) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { projectId } = await params;

  // Fetch Columns with their Tasks, ordered by 'order' index
  const columns = await prisma.column.findMany({
    where: {
      projectId,
      project: {
        members: {
          some: {
            id: user.id,
          },
        },
      },
    },
    orderBy: { order: "asc" },
    include: {
      tasks: {
        orderBy: { order: "asc" },
        include: {
          assignee: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
        },
      },
    },
  });

  return NextResponse.json(columns);
}
