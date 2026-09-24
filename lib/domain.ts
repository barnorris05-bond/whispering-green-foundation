/** Shared Zod schemas + domain constants used by both client and server. */

export const WASTE_CATEGORIES = ["plastic", "dry_recyclable", "mixed_household", "other"] as const;
export type WasteCategory = (typeof WASTE_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<string, string> = {
  plastic: "Plastic",
  dry_recyclable: "Dry recyclable",
  mixed_household: "Mixed household",
  other: "Other",
};

export const UNITS = ["kg", "bags", "other"] as const;

export const REQUEST_STATUSES = [
  "submitted",
  "under_review",
  "approved",
  "scheduled",
  "in_progress",
  "completed",
  "rejected",
  "cancelled",
] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  approved: "Approved",
  scheduled: "Scheduled",
  in_progress: "In progress",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

/** Allowed forward transitions (nonsense transitions rejected server-side). */
export const STATUS_TRANSITIONS: Record<string, string[]> = {
  submitted: ["under_review", "approved", "scheduled", "rejected", "cancelled"],
  under_review: ["approved", "scheduled", "in_progress", "rejected", "cancelled"],
  approved: ["scheduled", "in_progress", "completed", "rejected", "cancelled"],
  scheduled: ["scheduled", "in_progress", "completed", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  rejected: [],
  cancelled: [],
};

/** Public-facing status lines: deliberately vague, no private data. */
export const PUBLIC_STATUS_LABELS: Record<string, string> = {
  submitted: "Request received",
  under_review: "Being reviewed by our team",
  approved: "Approved for collection",
  scheduled: "Collection scheduled",
  in_progress: "Collection in progress",
  completed: "Collection completed",
  rejected: "Not accepted — see staff note",
  cancelled: "Request cancelled",
};

export const VERIFICATION_STATUSES = ["draft", "verified", "rejected"] as const;
export const MEASUREMENT_TYPES = ["measured", "estimated"] as const;

export const EVENT_STATUSES = ["draft", "published", "completed", "cancelled"] as const;
export const PROJECT_STATUSES = ["draft", "active", "completed", "archived"] as const;
export const CONTENT_CATEGORIES = [
  "waste_segregation",
  "plastic_awareness",
  "recycling",
  "responsible_disposal",
  "community_action",
] as const;
export const CONTENT_CATEGORY_LABELS: Record<string, string> = {
  waste_segregation: "Waste segregation",
  plastic_awareness: "Plastic awareness",
  recycling: "Recycling",
  responsible_disposal: "Responsible disposal",
  community_action: "Community action",
};

export const LOCALITIES = [
  "Vasai-West (general)",
  "Bhabola",
  "Chulne",
  "Manickpur",
  "Navghar Road",
  "Papdi",
  "Rangaon",
  "Other",
] as const;

// ------------------------------------------------------------------- schemas

import { z } from "zod";

const contact = z
  .string()
  .trim()
  .min(1, "Provide a contact so we can confirm the collection.");

export const collectionRequestSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your full name.").max(80),
    email: z
      .union([z.string().trim().email("Enter a valid email address."), z.literal("")])
      .optional()
      .transform((v) => (v ? v : undefined)),
    phone: z
      .union([
        z
          .string()
          .trim()
          .regex(/^[+\d][\d\s-]{6,17}$/, "Enter a valid phone number."),
        z.literal(""),
      ])
      .optional()
      .transform((v) => (v ? v : undefined)),
    category: z.enum(WASTE_CATEGORIES, { message: "Choose a waste category." }),
    description: z.string().trim().min(10, "Describe the waste in at least 10 characters.").max(2000),
    quantity: z
      .union([z.coerce.number().positive("Quantity must be a positive number.").max(100000), z.literal("")])
      .optional()
      .transform((v) => (v === "" || v === undefined ? undefined : Number(v))),
    unit: z.enum(UNITS).default("kg"),
    locality: z.string().trim().min(2, "Tell us the locality/area.").max(80),
    address: z.string().trim().max(300).optional().transform((v) => (v ? v : undefined)),
    preferredDate: z
      .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date picker."), z.literal("")])
      .optional()
      .transform((v) => (v ? v : undefined)),
    consent: z.literal(true, { message: "Please acknowledge the request terms." }),
  })
  .refine((d) => Boolean(d.email || d.phone), {
    message: "Provide at least one valid contact method (email or phone).",
    path: ["email"],
  })
  .refine(
    (d) => !d.preferredDate || new Date(`${d.preferredDate}T23:59:59`) >= new Date(),
    { message: "Preferred date cannot be in the past.", path: ["preferredDate"] }
  )
  .refine((d) => Boolean(d.email || d.phone), {
    message: "At least one contact method is required.",
    path: ["phone"],
  });

export type CollectionRequestInput = z.infer<typeof collectionRequestSchema>;

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(80),
  email: z.union([z.string().trim().email("Enter a valid email."), z.literal("")]).optional(),
  phone: z.string().trim().max(20).optional(),
  subject: z.string().trim().min(3, "Add a short subject.").max(120),
  message: z.string().trim().min(10, "Message must be at least 10 characters.").max(3000),
});

export const volunteerSchema = z.object({
  eventId: z.string().min(1),
  name: z.string().trim().min(2, "Please enter your full name.").max(80),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().max(20).optional(),
});

export const trackSchema = z.object({
  referenceCode: z.string().trim().min(6).max(20).regex(/^[A-Z0-9-]+$/i, "Reference codes contain letters, numbers and dashes."),
  contact: z.string().trim().min(3, "Enter the email or phone you submitted with."),
});
