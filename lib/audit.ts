import { prisma } from "./db";
import type { SessionUser } from "./auth";

export const AUDIT_ACTIONS = {
  login: "auth.login",
  logout: "auth.logout",
  requestCreated: "request.created",
  requestStatusChanged: "request.status_changed",
  recordCreated: "record.created",
  recordVerified: "record.verified",
  eventCreated: "event.created",
  eventStatusChanged: "event.status_changed",
  contentPublished: "content.published",
  mediaUploaded: "media.uploaded",
  settingsUpdated: "settings.updated",
  staffCreated: "staff.created",
  staffDisabled: "staff.disabled",
  messageStatusChanged: "message.status_changed",
} as const;

export async function audit(
  actor: SessionUser | null,
  action: string,
  entityType: string,
  entityId?: string | null,
  metadata?: Record<string, unknown>
) {
  await prisma.auditLog.create({
    data: {
      actorId: actor?.id ?? null,
      action,
      entityType,
      entityId: entityId ?? null,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
}
