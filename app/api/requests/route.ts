import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { collectionRequestSchema } from "@/lib/domain";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { generateReferenceCode } from "@/lib/format";
import { saveUpload } from "@/lib/uploads";
import { AUDIT_ACTIONS } from "@/lib/audit";
import { createHistory } from "@/lib/requests";

export async function POST(req: Request) {
  const rl = rateLimit(clientKey(req, "request-submit"), 5, 15 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Too many submissions from this device. Please wait ${Math.ceil(rl.retryAfterSec / 60)} minutes.` },
      { status: 429 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const s = (k: string) => {
    const v = form.get(k);
    return typeof v === "string" ? v : "";
  };
  const raw = {
    name: s("name"),
    email: s("email"),
    phone: s("phone"),
    category: s("category"),
    description: s("description"),
    quantity: s("quantity"),
    unit: s("unit") || "kg",
    locality: s("locality"),
    address: s("address"),
    preferredDate: s("preferredDate"),
    consent: form.get("consent") === "true",
  };

  const parsed = collectionRequestSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return NextResponse.json({ error: "Please fix the highlighted fields.", fieldErrors }, { status: 400 });
  }
  const data = parsed.data;

  // photo upload (validated in saveUpload)
  let photoPath: string | undefined;
  const photo = form.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const saved = await saveUpload(photo, "request");
    if (!saved.ok) {
      return NextResponse.json({ error: saved.error }, { status: 400 });
    }
    photoPath = saved.path;
  }

  // unique reference with retry on collision
  let referenceCode = generateReferenceCode();
  for (let i = 0; i < 5; i++) {
    const clash = await prisma.collectionRequest.findUnique({ where: { referenceCode } });
    if (!clash) break;
    referenceCode = generateReferenceCode();
  }

  const user = await getCurrentUser();

  const request = await prisma.collectionRequest.create({
    data: {
      referenceCode,
      userId: user?.id ?? null,
      name: data.name,
      email: data.email,
      phone: data.phone,
      category: data.category,
      description: data.description,
      quantity: data.quantity,
      unit: data.unit,
      locality: data.locality,
      address: data.address,
      preferredDate: data.preferredDate ? new Date(`${data.preferredDate}T00:00:00`) : null,
      photoPath,
      status: "submitted",
    },
  });

  await createHistory(request.id, null, "submitted", user?.id, "Request submitted by resident.");
  await prisma.auditLog.create({
    data: {
      actorId: user?.id,
      action: AUDIT_ACTIONS.requestCreated,
      entityType: "collection_request",
      entityId: request.id,
      metadata: JSON.stringify({ referenceCode }),
    },
  });

  return NextResponse.json({ ok: true, referenceCode, id: request.id }, { status: 201 });
}
