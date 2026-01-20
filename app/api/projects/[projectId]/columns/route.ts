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

export async function POST(
  request: Request,
  { params }: { params: { projectId: string } },
) {
  try {
    const user = await getCurrentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const {projectId} = await params;

    const { title, order } = await request.json();

    // Ensure title exists
    if (!title) return new NextResponse("Title is required", { status: 400 });

    const column = await prisma.column.create({
      data: {
        title,
        order: order || 0,
        projectId: projectId,
      },
      include: {
        tasks: true,
      },
    });

    return NextResponse.json(column);
  } catch (error) {
    console.error("COLUMN_CREATE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
