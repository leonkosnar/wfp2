import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";
import { logAction } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json();

    if (!email || !password || !fullName) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    // 1. Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return new NextResponse("User already exists", { status: 409 });
    }

    // 2. Create User
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        fullName,
      },
    });

      await logAction("USER CREATED", {
        userId: user.id,
        message: `${user.id} has been created with the email ${email}`,
      });

    // 3. Log them in immediately (Create Session)
    await createSession(user.id, request);

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error("Registration error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
