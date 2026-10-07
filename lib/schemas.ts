/**
 * Zod schemas for every public input surface.
 *
 * WHY THIS IS A SEPARATE FILE FROM `lib/domain.ts`:
 * `lib/domain.ts` holds only plain constants and labels, and it is imported by
 * client components (the request form, the tracking page, the admin managers).
 * Importing zod from that module pulled the whole validation library into the
 * browser bundle — roughly 100 kB of extra JavaScript on /request-collection and
 * /track-request for code those pages never run. Validation lives here, and only
 * server-side files (API routes, server actions) import it.
 */

import { z } from "zod";
import { UNITS, WASTE_CATEGORIES } from "./domain";

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
