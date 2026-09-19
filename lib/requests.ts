import { prisma } from "./db";
import { PUBLIC_STATUS_LABELS, STATUS_LABELS } from "./domain";
import { generateReferenceCode } from "./format";

export async function createHistory(
  requestId: string,
  oldStatus: string | null,
  newStatus: string,
  changedBy?: string | null,
  note?: string | null
) {
  return prisma.requestStatusHistory.create({
    data: { requestId, oldStatus, newStatus, changedBy: changedBy ?? null, note: note ?? null },
  });
}

/** Public-safe shape for tracking — no name, email, phone, or address. */
export function publicRequestView(r: {
  referenceCode: string;
  status: string;
  createdAt: Date;
  category: string;
  locality: string;
  quantity: number | null;
  unit: string;
}) {
  return {
    referenceCode: r.referenceCode,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    category: r.category,
    locality: r.locality,
    quantity: r.quantity ? `${r.quantity} ${r.unit}` : null,
    updates: [] as Array<{ at: string; label: string; note?: string | null }>,
  };
}
