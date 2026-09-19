import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { contactMessageSchema } from "@/lib/domain";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const rl = rateLimit(clientKey(req, "contact"), 5, 15 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many messages. Please wait a few minutes." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = contactMessageSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return NextResponse.json({ error: "Please fix the highlighted fields.", fieldErrors }, { status: 400 });
  }

  const msg = await prisma.contactMessage.create({ data: parsed.data });

  return NextResponse.json({ ok: true, id: msg.id }, { status: 201 });
}
