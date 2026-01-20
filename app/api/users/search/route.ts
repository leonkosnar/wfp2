import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 3) return NextResponse.json([]);

  const users = await prisma.user.findMany({
    where: {
      email: { contains: query },
      NOT: { id: user.id } // Don't show the current user in search
    },
    select: { id: true, email: true, fullName: true },
    take: 5
  });

  return NextResponse.json(users);
}