import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { logAction } from "@/lib/audit";

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { currentPassword, newPassword } = await req.json();

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  const isMatch = await bcrypt.compare(currentPassword, dbUser!.passwordHash);

  if (!isMatch)
    return new NextResponse("Invalid current password", { status: 400 });

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hashedNewPassword },
  });

  await logAction("USER EDITED", {
    userId: user.id,
    message: `${user.id} has updated their account`,
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  await prisma.user.delete({
    where: { id: user.id },
  });

  await logAction("USER DELETED", {
    userId: user.id,
    message: `${user.id} has deleted their account`,
  });

  return NextResponse.json({ success: true });
}
