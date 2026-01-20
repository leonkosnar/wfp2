import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } },
) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const activity = await prisma.activityLog.findMany({
    where: { projectId: params.projectId,
    project: {
      members: {
        some: {
          id: user.id,
        },
      },
    }, },
    include: {
      project: { select: { members: true } },
      user: { select: { fullName: true, avatarUrl: true } },
      task: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50, // Limit to recent 50 actions
  });

  return NextResponse.json(activity);
}
