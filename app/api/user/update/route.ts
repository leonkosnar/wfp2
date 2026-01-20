import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { fullName } = await req.json();

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { fullName },
  });

  await logAction(
    "PROFILE UPDATED",
    {
      userId: user.id,
      message: `Updated profile name of user ${user.id} to ${fullName}`
    }
  );

  return NextResponse.json(updatedUser);
}
