import { prisma } from "./db";

/** Append a status-history entry to a request (audit trail for the resident timeline). */
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
