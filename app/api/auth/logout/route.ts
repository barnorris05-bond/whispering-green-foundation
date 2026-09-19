import { NextResponse } from "next/server";
import { destroySession, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  const user = await getCurrentUser();
  await destroySession();
  if (user) {
    await prisma.auditLog.create({
      data: { actorId: user.id, action: "logout", entityType: "session", entityId: user.id },
    });
  }
  return NextResponse.json({ ok: true });
}
