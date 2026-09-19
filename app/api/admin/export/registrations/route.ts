import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const eventId = url.searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "Missing eventId" }, { status: 400 });

  const regs = await prisma.volunteerRegistration.findMany({
    where: { eventId },
    orderBy: { createdAt: "asc" },
  });

  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const rows = [
    ["Name", "Email", "Phone", "Status", "Attendance", "Registered at"],
    ...regs.map((r) => [r.name, r.email, r.phone ?? "", r.status, r.attendance ?? "", r.createdAt.toISOString()]),
  ].map((r) => r.map(esc).join(",")).join("\n");

  return new NextResponse(rows, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="registrations-${eventId}.csv"`,
    },
  });
}
