import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function PATCH(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const user = await getCurrentUser();
  if(!user) return new NextResponse("Forbidden", { status: 403 });
  const {projectId} = await params;

  const { title, description, ownerId } = await request.json();

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return new NextResponse("Not Found", { status: 404 });

  // Only owner or Admin can modify project settings
  if (project.ownerId !== user?.id && user?.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  if(title && project.title != title)
  await logAction("PROJECT EDITED", {
    userId: user.id,
    message: `${user.id} has edited the title of ${title} (${projectId})`,
    projectId,
  });
  if(description && project.description != description)
  await logAction("PROJECT EDITED", {
    userId: user.id,
    message: `${user.id} has edited the description of ${title} (${projectId})`,
    projectId,
  });
  if(ownerId && project.ownerId != ownerId)
  await logAction("PROJECT TRANSFERED", {
    userId: user.id,
    message: `${user.id} has transfered ownership of the project ${title} (${projectId}) to ${ownerId}`,
    projectId,
  });

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: { 
      title, 
      description, 
      ownerId // Transfer ownership by passing a new userId
    },
  });

  return NextResponse.json(updatedProject);
}

export async function DELETE(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const user = await getCurrentUser();
  if(!user) return new NextResponse("Forbidden", { status: 403 });
  const {projectId} = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (project?.ownerId !== user?.id && user?.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  await prisma.project.delete({ where: { id: projectId } });
  return NextResponse.json({ success: true });
}