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

/**
 * Project categories are a DIFFERENT set from waste categories
 * (`WASTE_CATEGORIES`). Using `CATEGORY_LABELS` for a project silently falls
 * back to the raw column value, which is why these labels live separately.
 */
export const PROJECT_CATEGORIES = ["waste", "education", "cleanup", "other"] as const;
export const PROJECT_CATEGORY_LABELS: Record<string, string> = {
  waste: "Waste management",
  education: "Education",
  cleanup: "Clean-up drives",
  other: "Other",
};

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};
export const CONTENT_CATEGORIES = [
  "waste_segregation",
  "plastic_awareness",
  "recycling",
  "responsible_disposal",
  "community_action",
  "founder_note",
] as const;
export const CONTENT_CATEGORY_LABELS: Record<string, string> = {
  waste_segregation: "Waste segregation",
  plastic_awareness: "Plastic awareness",
  recycling: "Recycling",
  responsible_disposal: "Responsible disposal",
  community_action: "Community action",
  founder_note: "Founder's story (Foundation Journey)",
};

/**
 * `founder_note` entries are authored through the normal admin content editor
 * but belong to /journey, not to the awareness portal. Everything that lists or
 * filters public articles must use `AWARENESS_CATEGORIES` instead of
 * `CONTENT_CATEGORIES` so the founder's message never leaks into the portal.
 */
export const JOURNEY_CONTENT_CATEGORY = "founder_note";

/** Public awareness categories (everything except Journey-only content). */
export const AWARENESS_CATEGORIES = CONTENT_CATEGORIES.filter(
  (c) => c !== JOURNEY_CONTENT_CATEGORY
);

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
