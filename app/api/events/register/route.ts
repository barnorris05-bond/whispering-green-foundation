import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { volunteerSchema } from "@/lib/domain";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const rl = rateLimit(clientKey(req, "volunteer"), 8, 15 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many attempts. Please wait a few minutes." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = volunteerSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return NextResponse.json({ error: "Please fix the highlighted fields.", fieldErrors }, { status: 400 });
  }
  const d = parsed.data;

  const event = await prisma.event.findUnique({
    where: { id: d.eventId },
    include: { _count: { select: { registrations: { where: { status: { not: "cancelled" } } } } } },
  });
  if (!event || event.status !== "published") {
    return NextResponse.json({ error: "This event is not open for registration." }, { status: 400 });
  }

  const now = new Date();
  if (event.eventDate < now) {
    return NextResponse.json({ error: "This event has already taken place." }, { status: 400 });
  }
  if (event.registrationDeadline && event.registrationDeadline < now) {
    return NextResponse.json({ error: "Registration deadline has passed." }, { status: 400 });
  }
  if (event.capacity != null && event._count.registrations >= event.capacity) {
    return NextResponse.json({ error: "This event is at full capacity." }, { status: 400 });
  }

  const email = d.email.trim().toLowerCase();
  const duplicate = await prisma.volunteerRegistration.findUnique({
    where: { eventId_email: { eventId: d.eventId, email } },
  });
  if (duplicate && duplicate.status !== "cancelled") {
    return NextResponse.json({ error: "This email is already registered for the event." }, { status: 409 });
  }

  const user = await getCurrentUser();

  const reg = duplicate
    ? await prisma.volunteerRegistration.update({ where: { id: duplicate.id }, data: { status: "confirmed", name: d.name, phone: d.phone } })
    : await prisma.volunteerRegistration.create({
        data: {
          eventId: d.eventId,
          email,
          name: d.name,
          phone: d.phone,
          userId: user?.id ?? null,
        },
      });

  return NextResponse.json({ ok: true, id: reg.id }, { status: 201 });
}
