"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { STATUS_TRANSITIONS } from "@/lib/domain";
import { createHistory } from "@/lib/requests";
import { audit, AUDIT_ACTIONS } from "@/lib/audit";
import { saveUpload } from "@/lib/uploads";
import { slugify } from "@/lib/format";
import { z } from "zod";

type ActionState = { ok: boolean; error?: string; message?: string; fieldErrors?: Record<string, string> };

const staffGuard = async () => {
  const user = await getCurrentUser();
  if (!user) return { user: null, error: { ok: false, error: "Not authorized." } as ActionState };
  return { user, error: null };
};

const founderGuard = async () => {
  const user = await getCurrentUser();
  if (!user || user.role !== "founder") return { user: null, error: { ok: false, error: "Founder access required." } as ActionState };
  return { user, error: null };
};

/* ------------------------------------------------------ request status */

export async function updateRequestStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const guard = await staffGuard();
  if (guard.error) return guard.error;
  const user = guard.user!;

  const requestId = String(formData.get("requestId") ?? "");
  const newStatus = String(formData.get("newStatus") ?? "");
  const note = String(formData.get("note") ?? "").trim() || null;
  const scheduledDate = String(formData.get("scheduledDate") ?? "").trim();
  const assignedEventId = String(formData.get("assignedEventId") ?? "").trim();

  const request = await prisma.collectionRequest.findUnique({ where: { id: requestId } });
  if (!request) return { ok: false, error: "Request not found." };

  const allowed = STATUS_TRANSITIONS[request.status] ?? [];
  const isReschedule = request.status === "scheduled" && newStatus === "scheduled";
  if (!allowed.includes(newStatus) && !isReschedule) {
    return { ok: false, error: `Cannot move from "${request.status}" to "${newStatus}".` };
  }

  // Rejections and cancellations must always carry a resident-readable reason.
  if ((newStatus === "rejected" || newStatus === "cancelled") && !note) {
    return { ok: false, error: "A reason is required — write it in the note to the resident, then retry." };
  }

  // Scheduling requires a valid date that is not in the past.
  let scheduledAt: Date | null = request.scheduledDate;
  if (newStatus === "scheduled") {
    if (!/\d{4}-\d{2}-\d{2}/.test(scheduledDate)) {
      return { ok: false, error: "Pick a collection date to schedule this request." };
    }
    scheduledAt = new Date(`${scheduledDate}T00:00:00`);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (Number.isNaN(scheduledAt.getTime()) || scheduledAt < today) {
      return { ok: false, error: "The collection date cannot be in the past — reschedule with today or a later date." };
    }
    // An optional linked event must exist and actually be published.
    if (assignedEventId) {
      const ev = await prisma.event.findUnique({ where: { id: assignedEventId }, select: { status: true } });
      if (!ev || ev.status !== "published") {
        return { ok: false, error: "Linked event not found or not published — pick a published event or leave it empty." };
      }
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.collectionRequest.update({
      where: { id: requestId },
      data: {
        status: newStatus,
        scheduledDate: scheduledAt,
        assignedEventId: assignedEventId || null,
      },
    });
    await tx.requestStatusHistory.create({
      data: { requestId, oldStatus: request.status, newStatus, changedBy: user.id, note },
    });
  });

  await audit(user, AUDIT_ACTIONS.requestStatusChanged, "collection_request", requestId, { from: request.status, to: newStatus });
  revalidatePath("/admin/requests");
  revalidatePath("/admin");
  return { ok: true, message: `Request ${request.referenceCode} → ${newStatus.replace(/_/g, " ")}.` };
}

export async function addInternalNote(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const guard = await staffGuard();
  if (guard.error) return guard.error;
  const user = guard.user!;
  const requestId = String(formData.get("requestId") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!note) return { ok: false, error: "Note cannot be empty." };
  const request = await prisma.collectionRequest.findUnique({ where: { id: requestId } });
  if (!request) return { ok: false, error: "Request not found." };
  await prisma.requestStatusHistory.create({
    data: { requestId, oldStatus: request.status, newStatus: request.status, changedBy: user.id, note },
  });
  revalidatePath("/admin/requests");
  return { ok: true, message: "Note added to history." };
}

/* ------------------------------------------------------ collection records */

const recordSchema = z.object({
  collectionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid date."),
  locality: z.string().trim().min(2, "Locality is required.").max(80),
  category: z.string().trim().min(2, "Category is required."),
  quantity: z.coerce.number().positive("Quantity must be positive.").max(1_000_000),
  unit: z.string().trim().min(1),
  measurementType: z.enum(["measured", "estimated"]),
  verificationStatus: z.enum(["draft", "verified", "rejected"]),
  notes: z.string().trim().max(1000).optional(),
  eventId: z.string().optional(),
  projectId: z.string().optional(),
  requestId: z.string().optional(),
});

export async function upsertCollectionRecord(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const guard = await staffGuard();
  if (guard.error) return guard.error;
  const user = guard.user!;

  const parsed = recordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = String(issue.path[0] ?? "form");
      if (!fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return { ok: false, error: "Check the form fields.", fieldErrors };
  }
  const d = parsed.data;

  const id = String(formData.get("id") ?? "");
  const data = {
    collectionDate: new Date(`${d.collectionDate}T00:00:00`),
    locality: d.locality,
    category: d.category,
    quantity: d.quantity,
    unit: d.unit,
    measurementType: d.measurementType,
    verificationStatus: d.verificationStatus,
    notes: d.notes || null,
    eventId: d.eventId || null,
    projectId: d.projectId || null,
    requestId: d.requestId || null,
    recordedById: user.id,
    source: "field" as const,
  };

  if (id) {
    await prisma.collectionRecord.update({ where: { id }, data });
    await audit(user, AUDIT_ACTIONS.recordVerified, "collection_record", id, { verificationStatus: d.verificationStatus });
  } else {
    const rec = await prisma.collectionRecord.create({ data });
    await audit(user, AUDIT_ACTIONS.recordCreated, "collection_record", rec.id, { quantity: d.quantity, unit: d.unit });
  }

  revalidatePath("/admin/collections");
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true, message: id ? "Record updated." : "Record added." };
}

export async function deleteCollectionRecord(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const guard = await staffGuard();
  if (guard.error) return guard.error;
  const id = String(formData.get("id") ?? "");
  await prisma.collectionRecord.delete({ where: { id } });
  revalidatePath("/admin/collections");
  revalidatePath("/");
  return { ok: true, message: "Record deleted." };
}

/* ------------------------------------------------------ events */

const eventSchema = z.object({
  title: z.string().trim().min(3, "Title is required.").max(120),
  description: z.string().trim().min(10, "Description is required.").max(4000),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid date."),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional().or(z.literal("")),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional().or(z.literal("")),
  locality: z.string().trim().min(2, "Locality is required.").max(80),
  registrationDeadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  capacity: z.union([z.coerce.number().int().positive().max(100000), z.literal("")]).optional(),
});

export async function upsertEvent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const guard = await staffGuard();
  if (guard.error) return guard.error;
  const user = guard.user!;

  const parsed = eventSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = String(issue.path[0] ?? "form");
      if (!fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return { ok: false, error: "Check the form fields.", fieldErrors };
  }
  const d = parsed.data;

  const id = String(formData.get("id") ?? "");
  const data = {
    title: d.title,
    description: d.description,
    eventDate: new Date(`${d.eventDate}T00:00:00`),
    startTime: d.startTime || null,
    endTime: d.endTime || null,
    locality: d.locality,
    registrationDeadline: d.registrationDeadline ? new Date(`${d.registrationDeadline}T23:59:59`) : null,
    capacity: d.capacity === "" || d.capacity === undefined ? null : Number(d.capacity),
  };

  if (id) {
    await prisma.event.update({ where: { id }, data });
    revalidatePath("/admin/events");
    return { ok: true, message: "Event updated." };
  }

  let slug = slugify(d.title);
  if (await prisma.event.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36)}`;
  const ev = await prisma.event.create({ data: { ...data, slug, status: "draft", createdById: user.id } });
  await audit(user, AUDIT_ACTIONS.eventCreated, "event", ev.id, { title: d.title });
  revalidatePath("/admin/events");
  return { ok: true, message: `Event "${d.title}" created as draft.` };
}

const EVENT_TRANSITIONS: Record<string, string[]> = {
  draft: ["published", "cancelled"],
  published: ["completed", "cancelled", "draft"],
  completed: [],
  cancelled: ["draft"],
};

export async function setEventStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const guard = await staffGuard();
  if (guard.error) return guard.error;
  const user = guard.user!;
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!EVENT_TRANSITIONS[status] && !Object.values(EVENT_TRANSITIONS).flat().includes(status)) {
    return { ok: false, error: "Unknown status." };
  }
  const ev = await prisma.event.update({ where: { id }, data: { status } });
  await audit(user, AUDIT_ACTIONS.eventStatusChanged, "event", id, { status });
  revalidatePath("/admin/events");
  revalidatePath("/events");
  return { ok: true, message: `Event "${ev.title}" → ${status}.` };
}

export async function deleteEvent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const guard = await staffGuard();
  if (guard.error) return guard.error;
  const id = String(formData.get("id") ?? "");
  try {
    await prisma.event.delete({ where: { id } });
  } catch {
    return { ok: false, error: "Cannot delete: registrations or records reference this event." };
  }
  revalidatePath("/admin/events");
  revalidatePath("/events");
  return { ok: true, message: "Event deleted." };
}

export async function setAttendance(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const guard = await staffGuard();
  if (guard.error) return guard.error;
  const id = String(formData.get("id") ?? "");
  const attendance = String(formData.get("attendance") ?? "");
  await prisma.volunteerRegistration.update({
    where: { id },
    data: { attendance: attendance === "" ? null : attendance },
  });
  revalidatePath("/admin/volunteers");
  return { ok: true, message: "Attendance updated." };
}

export async function deleteRegistration(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const guard = await staffGuard();
  if (guard.error) return guard.error;
  const id = String(formData.get("id") ?? "");
  await prisma.volunteerRegistration.delete({ where: { id } });
  revalidatePath("/admin/volunteers");
  return { ok: true, message: "Registration removed." };
}

/* ------------------------------------------------------ projects */

const projectSchema = z.object({
  title: z.string().trim().min(3, "Title is required.").max(120),
  category: z.string().trim().min(2),
  description: z.string().trim().min(10, "Description is required.").max(6000),
  locality: z.string().trim().min(2, "Locality is required.").max(80),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  status: z.enum(["draft", "active", "completed", "archived"]),
  visibility: z.enum(["draft", "published"]),
});

export async function upsertProject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const guard = await staffGuard();
  if (guard.error) return guard.error;
  const user = guard.user!;
  const parsed = projectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = String(issue.path[0] ?? "form");
      if (!fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return { ok: false, error: "Check the form fields.", fieldErrors };
  }
  const d = parsed.data;
  const id = String(formData.get("id") ?? "");
  const data = {
    title: d.title,
    category: d.category,
    description: d.description,
    locality: d.locality,
    startDate: d.startDate ? new Date(`${d.startDate}T00:00:00`) : null,
    endDate: d.endDate ? new Date(`${d.endDate}T00:00:00`) : null,
    status: d.status,
    visibility: d.visibility,
  };

  if (id) {
    await prisma.project.update({ where: { id }, data });
    revalidatePath("/admin/projects");
    revalidatePath("/initiatives");
    return { ok: true, message: "Project updated." };
  }

  let slug = slugify(d.title);
  if (await prisma.project.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36)}`;
  await prisma.project.create({ data: { ...data, slug } });
  revalidatePath("/admin/projects");
  revalidatePath("/initiatives");
  return { ok: true, message: `Project "${d.title}" created.` };
}

export async function deleteProject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const guard = await staffGuard();
  if (guard.error) return guard.error;
  const id = String(formData.get("id") ?? "");
  try {
    await prisma.project.delete({ where: { id } });
  } catch {
    return { ok: false, error: "Cannot delete: records or media reference this project." };
  }
  revalidatePath("/admin/projects");
  revalidatePath("/initiatives");
  return { ok: true, message: "Project deleted." };
}

/* ------------------------------------------------------ content */

const contentSchema = z.object({
  title: z.string().trim().min(3, "Title is required.").max(160),
  category: z.string().trim().min(2),
  excerpt: z.string().trim().max(300).optional().or(z.literal("")),
  body: z.string().trim().min(30, "Body must be at least 30 characters."),
  readMinutes: z.union([z.coerce.number().int().min(1).max(60), z.literal("")]).optional(),
});

export async function upsertContent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const guard = await staffGuard();
  if (guard.error) return guard.error;
  const user = guard.user!;
  const parsed = contentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = String(issue.path[0] ?? "form");
      if (!fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return { ok: false, error: "Check the form fields.", fieldErrors };
  }
  const d = parsed.data;
  const id = String(formData.get("id") ?? "");
  const data = {
    title: d.title,
    category: d.category,
    excerpt: d.excerpt || null,
    body: d.body,
    readMinutes: d.readMinutes === "" || d.readMinutes === undefined ? 3 : Number(d.readMinutes),
  };

  if (id) {
    await prisma.content.update({ where: { id }, data });
    revalidatePath("/admin/content");
    revalidatePath("/awareness");
    return { ok: true, message: "Article updated." };
  }

  let slug = slugify(d.title);
  if (await prisma.content.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36)}`;
  await prisma.content.create({ data: { ...data, slug, status: "draft", authorId: user.id } });
  revalidatePath("/admin/content");
  return { ok: true, message: `Article "${d.title}" created as draft.` };
}

export async function setContentStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const guard = await staffGuard();
  if (guard.error) return guard.error;
  const user = guard.user!;
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["draft", "published", "archived"].includes(status)) return { ok: false, error: "Unknown status." };
  await prisma.content.update({
    where: { id },
    data: { status, publishedAt: status === "published" ? new Date() : undefined },
  });
  if (status === "published") await audit(user, AUDIT_ACTIONS.contentPublished, "content", id);
  revalidatePath("/admin/content");
  revalidatePath("/awareness");
  return { ok: true, message: `Article → ${status}.` };
}

export async function deleteContent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const guard = await staffGuard();
  if (guard.error) return guard.error;
  const id = String(formData.get("id") ?? "");
  await prisma.content.delete({ where: { id } });
  revalidatePath("/admin/content");
  revalidatePath("/awareness");
  return { ok: true, message: "Article deleted." };
}

/* ------------------------------------------------------ media / gallery */

const mediaSchema = z.object({
  caption: z.string().trim().max(200).optional().or(z.literal("")),
  altText: z.string().trim().max(200).optional().or(z.literal("")),
  visibility: z.enum(["approved", "pending", "private"]),
  eventId: z.string().optional().or(z.literal("")),
  projectId: z.string().optional().or(z.literal("")),
});

export async function uploadMedia(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const guard = await staffGuard();
  if (guard.error) return guard.error;
  const user = guard.user!;

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose an image to upload." };

  const parsed = mediaSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: "Check the media fields." };
  const d = parsed.data;

  const saved = await saveUpload(file, "gallery");
  if (!saved.ok) return { ok: false, error: saved.error };

  await prisma.media.create({
    data: {
      storagePath: saved.path!,
      caption: d.caption || null,
      altText: d.altText || null,
      visibility: d.visibility,
      eventId: d.eventId || null,
      projectId: d.projectId || null,
      uploadedById: user.id,
    },
  });
  await audit(user, AUDIT_ACTIONS.mediaUploaded, "media", null, { caption: d.caption });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { ok: true, message: "Photo uploaded." };
}

export async function setMediaVisibility(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const guard = await staffGuard();
  if (guard.error) return guard.error;
  const id = String(formData.get("id") ?? "");
  const visibility = String(formData.get("visibility") ?? "");
  if (!["approved", "pending", "private"].includes(visibility)) return { ok: false, error: "Unknown visibility." };
  await prisma.media.update({ where: { id }, data: { visibility } });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { ok: true, message: `Photo → ${visibility}.` };
}

export async function deleteMedia(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const guard = await staffGuard();
  if (guard.error) return guard.error;
  const id = String(formData.get("id") ?? "");
  const media = await prisma.media.findUnique({ where: { id } });
  if (media) {
    await prisma.media.delete({ where: { id } });
    // file removal is best-effort
    const { unlink } = await import("fs/promises");
    const path = await import("path");
    const root = path.join(process.cwd(), process.env.UPLOAD_DIR ?? "uploads");
    await unlink(path.join(root, media.storagePath)).catch(() => {});
  }
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { ok: true, message: "Photo deleted." };
}

/* ------------------------------------------------------ messages */

export async function setMessageStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const guard = await staffGuard();
  if (guard.error) return guard.error;
  const user = guard.user!;
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["new", "read", "archived"].includes(status)) return { ok: false, error: "Unknown status." };
  await prisma.contactMessage.update({ where: { id }, data: { status } });
  await audit(user, AUDIT_ACTIONS.messageStatusChanged, "contact_message", id, { status });
  revalidatePath("/admin/messages");
  return { ok: true, message: `Message → ${status}.` };
}

export async function deleteMessage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const guard = await staffGuard();
  if (guard.error) return guard.error;
  const id = String(formData.get("id") ?? "");
  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/admin/messages");
  return { ok: true, message: "Message deleted." };
}

/* ------------------------------------------------------ staff (founder) */

const staffSchema = z.object({
  name: z.string().trim().min(2, "Name is required.").max(80),
  email: z.string().trim().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export async function createStaff(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const guard = await founderGuard();
  if (guard.error) return guard.error;
  const user = guard.user!;
  const parsed = staffSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = String(issue.path[0] ?? "form");
      if (!fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return { ok: false, error: "Check the fields.", fieldErrors };
  }
  const d = parsed.data;
  const email = d.email.toLowerCase();
  if (await prisma.user.findUnique({ where: { email } })) {
    return { ok: false, error: "A user with this email already exists.", fieldErrors: { email: "Already in use." } };
  }
  const created = await prisma.user.create({
    data: {
      name: d.name,
      email,
      passwordHash: await hashPassword(d.password),
      role: "staff",
      mustChangePassword: true,
    },
  });
  await audit(user, AUDIT_ACTIONS.staffCreated, "user", created.id, { email });
  revalidatePath("/admin/staff");
  return { ok: true, message: `Staff account for ${d.name} created.` };
}

export async function toggleStaffActive(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const guard = await founderGuard();
  if (guard.error) return guard.error;
  const user = guard.user!;
  const id = String(formData.get("id") ?? "");
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return { ok: false, error: "User not found." };
  if (target.id === user.id) return { ok: false, error: "You cannot disable your own account." };
  if (target.role === "founder") return { ok: false, error: "The founder account cannot be disabled." };
  await prisma.user.update({ where: { id }, data: { isActive: !target.isActive } });
  if (target.isActive) {
    await prisma.session.deleteMany({ where: { userId: id } });
  }
  await audit(user, AUDIT_ACTIONS.staffDisabled, "user", id, { active: !target.isActive });
  revalidatePath("/admin/staff");
  return { ok: true, message: target.isActive ? "Account disabled." : "Account re-enabled." };
}

export async function resetStaffPassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const guard = await founderGuard();
  if (guard.error) return guard.error;
  const user = guard.user!;
  const id = String(formData.get("id") ?? "");
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return { ok: false, error: "User not found." };
  await prisma.user.update({ where: { id }, data: { passwordHash: await hashPassword(password), mustChangePassword: true } });
  await prisma.session.deleteMany({ where: { userId: id } });
  await audit(user, "staff.password_reset", "user", id);
  revalidatePath("/admin/staff");
  return { ok: true, message: `Password reset for ${target.name}. They must change it at next sign-in.` };
}

/* ------------------------------------------------------ settings & password */

const settingsSchema = z.object({
  displayName: z.string().trim().min(2).max(120),
  tagline: z.string().trim().max(200).optional().or(z.literal("")),
  contactEmail: z.union([z.string().trim().email("Enter a valid email."), z.literal("")]).optional(),
  contactPhone: z.string().trim().max(24).optional().or(z.literal("")),
  publicLocation: z.string().trim().max(160).optional().or(z.literal("")),
  socialFacebook: z.union([z.string().trim().url("Enter a full URL."), z.literal("")]).optional(),
  socialInstagram: z.union([z.string().trim().url("Enter a full URL."), z.literal("")]).optional(),
  footerNote: z.string().trim().max(400).optional().or(z.literal("")),
});

export async function updateSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const guard = await founderGuard();
  if (guard.error) return guard.error;
  const user = guard.user!;
  const parsed = settingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = String(issue.path[0] ?? "form");
      if (!fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return { ok: false, error: "Check the fields.", fieldErrors };
  }
  const d = parsed.data;
  const data = {
    displayName: d.displayName,
    tagline: d.tagline || "",
    contactEmail: d.contactEmail || "",
    contactPhone: d.contactPhone || "",
    publicLocation: d.publicLocation || "",
    socialFacebook: d.socialFacebook || "",
    socialInstagram: d.socialInstagram || "",
    footerNote: d.footerNote || "",
  };
  const existing = await prisma.foundationSettings.findFirst();
  if (existing) {
    await prisma.foundationSettings.update({ where: { id: existing.id }, data });
  } else {
    await prisma.foundationSettings.create({ data: { id: 1, ...data } });
  }
  await audit(user, AUDIT_ACTIONS.settingsUpdated, "foundation_settings", "1");
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  return { ok: true, message: "Settings saved." };
}

const passwordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password."),
    next: z.string().min(8, "New password must be at least 8 characters."),
    confirm: z.string().min(1, "Confirm the new password."),
  })
  .refine((d) => d.next === d.confirm, { message: "Passwords do not match.", path: ["confirm"] });

export async function changeOwnPassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const guard = await staffGuard();
  if (guard.error) return guard.error;
  const user = guard.user!;
  const parsed = passwordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = String(issue.path[0] ?? "form");
      if (!fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return { ok: false, error: "Check the fields.", fieldErrors };
  }
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return { ok: false, error: "Account not found." };
  if (!(await verifyPassword(parsed.data.current, dbUser.passwordHash))) {
    return { ok: false, error: "Current password is incorrect.", fieldErrors: { current: "Incorrect password." } };
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.next), mustChangePassword: false },
  });
  revalidatePath("/admin/settings");
  return { ok: true, message: "Password changed." };
}

export async function goToChangePassword() {
  redirect("/admin/settings#password");
}
