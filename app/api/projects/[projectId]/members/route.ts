import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function POST(
  request: Request,
  { params }: { params: { projectId: string } },
) {
  const { projectId } = await params;
  const user = await getCurrentUser();
  const { userId } = await request.json();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });
  if (project?.ownerId !== user?.id || !user)
    return new NextResponse("Forbidden", { status: 403 });

  const userToAdd = await prisma.user.findUnique({ where: { id: userId } });
  if (!userToAdd) return new NextResponse("User not found", { status: 404 });

  await logAction("ADDED MEMBER", {
    userId: user.id,
    message: `${user.id} has added ${userId} to the project ${projectId}`,
    projectId,
  });

  const membership = await prisma.projectMember.create({
    data: { projectId: projectId, userId: userToAdd.id },
  });

  return NextResponse.json(membership);
}

export async function DELETE(
  request: Request,
  { params }: { params: { projectId: string } },
) {
  const { projectId } = await params;
  const user = await getCurrentUser();
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!user || project?.ownerId !== user?.id)
    return new NextResponse("Forbidden", { status: 403 });

  const { membershipId } = await request.json();

  await logAction("ADDED MEMBER", {
    userId: user.id,
    message: `${user.id} has removed ${membershipId} from the project ${projectId}`,
    projectId,
  });

  await prisma.projectMember.delete({ where: { id: membershipId } });
  return NextResponse.json({ success: true });
}
