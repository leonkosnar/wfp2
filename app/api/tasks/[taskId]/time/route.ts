import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { taskId } = await params;
  const { durationMin, description, startTime } = await request.json();

  const log = await prisma.timeLog.create({
    data: {
      taskId: taskId,
      userId: user.id,
      durationMin,
      description,
      startTime: new Date(startTime),
    },
  });

  return NextResponse.json(log);
}