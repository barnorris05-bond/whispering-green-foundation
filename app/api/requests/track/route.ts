import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { trackSchema } from "@/lib/domain";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { PUBLIC_STATUS_LABELS } from "@/lib/domain";
import { toDateInput } from "@/lib/format";

export async function POST(req: Request) {
  const rl = rateLimit(clientKey(req, "track"), 20, 10 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many lookups. Please wait a few minutes." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid reference code and your contact." }, { status: 400 });
  }
  const code = parsed.data.referenceCode.trim().toUpperCase();
  const contact = parsed.data.contact.trim().toLowerCase();

  const request = await prisma.collectionRequest.findUnique({
    where: { referenceCode: code },
    include: {
      history: { orderBy: { createdAt: "asc" }, where: { note: { not: null } } },
    },
  });

  // Contact must match email OR phone (case/space-insensitive). A code alone reveals nothing.
  const emailMatch = request?.email && request.email.toLowerCase() === contact;
  const phoneMatch = request?.phone && request.phone.replace(/[\s-]/g, "") === contact.replace(/[\s-]/g, "");
  if (!request || (!emailMatch && !phoneMatch)) {
    return NextResponse.json({ error: "No matching request." }, { status: 404 });
  }

  const updates = request.history
    .filter((h) => h.note)
    .map((h) => ({
      at: h.createdAt.toISOString(),
      label: PUBLIC_STATUS_LABELS[h.newStatus] ?? h.newStatus,
      note: h.note,
    }));

  return NextResponse.json({
    request: {
      referenceCode: request.referenceCode,
      status: request.status,
      createdAt: request.createdAt.toISOString(),
      category: request.category,
      locality: request.locality,
      quantity: request.quantity ? `${request.quantity} ${request.unit}` : null,
      // Safe to show: date-only, only once the collection is actually scheduled.
      // Local calendar date — the same one staff picked (never a UTC slice).
      scheduledDate:
        (request.status === "scheduled" || request.status === "in_progress") && request.scheduledDate
          ? toDateInput(request.scheduledDate)
          : null,
      updates,
    },
  });
}
