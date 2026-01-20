import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. Find User
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      await logAction("FAILED LOGIN", {
        message: `A login attempt has with the email ${email} has failed`,
      });
      return new NextResponse("Invalid credentials", { status: 401 });
    }

    // 2. Check Password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      await logAction("FAILED LOGIN", {
        userId: user.id,
        message: `A login attempt has with the email ${email} has failed`,
      });
      return new NextResponse("Invalid credentials", { status: 401 });
    }

    // 3. Create Session
    await createSession(user.id, request);

      await logAction("USER LOGIN", {
        userId: user.id,
        message: `${user.id} has logged in with the email ${email}`,
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
