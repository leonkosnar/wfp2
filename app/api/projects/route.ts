import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  // Requirement: "users can see a list of all projects they are a part of"
  const projects = await prisma.project.findMany({
    where: {
      OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
    },
    include: { owner: { select: { fullName: true } } },
  });

  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { title, description, key } = await request.json();

  const project = await prisma.project.create({
    data: {
      title,
      description,
      key: key.toUpperCase(),
      ownerId: user.id,
      // Automatically create default Kanban columns
      columns: {
        create: [
          { title: "To Do", order: 0 },
          { title: "In Progress", order: 1 },
          { title: "Done", order: 2 },
        ],
      },
    },
  });
  const membership = await prisma.projectMember.create({
    data: { projectId: project.id, userId: user.id },
  });

  return NextResponse.json(project);
}
