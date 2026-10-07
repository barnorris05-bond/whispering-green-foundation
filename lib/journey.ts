/**
 * Foundation Journey — public narrative content for `/journey`.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW TO EDIT THIS FILE
 * ─────────────────────────────────────────────────────────────────────────────
 * Everything on /journey that is not stored in the database lives here, so the
 * page itself never has to be touched to change the words.
 *
 * Anything written in [square brackets] is a DELIBERATE PLACEHOLDER. We do not
 * publish a founding year, milestone, award, partnership or photograph until
 * the foundation can stand behind it. To fill one in:
 *
 *   1. Replace the bracketed sentence with the real fact.
 *   2. Change that era's `source` from "placeholder" to "verified" so the
 *      "Awaiting foundation input" tag disappears.
 *   3. Keep `period` as plain text (e.g. "2019", "2021 – 2023", "Early 2026")
 *      so no exact date is implied that we have not confirmed.
 *
 * The founder's OWN words are not in this file. They are authored by staff in
 * Admin → Awareness content with the category "Founder's story (Foundation
 * Journey)" and appear automatically on /journey once published.
 */

import { Truck, Megaphone, Users, HeartHandshake, MapPin, ListChecks, type LucideIcon } from "lucide-react";

export const JOURNEY_HERO = {
  eyebrow: "Foundation Journey",
  title: "Our Journey",
  subtitle:
    "From community action to a growing movement for a cleaner, greener future.",
  intro:
    "This page follows the story of Whispering Green Foundation and the community work behind it — what we know, what we are still piecing together, and what comes next. Sections marked “awaiting foundation input” are honest placeholders, not omissions to be glossed over.",
} as const;

/** Shown on any timeline card that still needs verified information. */
export const PLACEHOLDER_TAG = "Awaiting foundation input";

/**
 * "Where it began" — the start of the story.
 *
 * The founder's message is deliberately NOT written here: inventing someone
 * else's origin story would be dishonest. The body below is what the page
 * renders until the founder publishes their own note through the admin
 * content editor.
 */
export const JOURNEY_BEGINNINGS = {
  eyebrow: "Where it began",
  title: "How this started",
  lead: "[Founder / Foundation story to be written here]",
  body: "[Add the verified story of how Whispering Green Foundation began — who started it, where, and when. This paragraph is a placeholder so the foundation can tell the story in its own words rather than have a website guess at it.]",
  supporting: [
    {
      label: "The founding",
      text: "[Founding year and circumstances — to be confirmed.]",
    },
    {
      label: "The first activity",
      text: "[The earliest collection drive, clean-up or awareness session we can verify.]",
    },
    {
      label: "The locality",
      text: "Vasai-West, Palghar, Maharashtra — the area the foundation works in.",
    },
  ],
} as const;

export type JourneySource = "verified" | "placeholder";

export interface JourneyEra {
  id: string;
  /** Plain text period label. Bracketed while unconfirmed. */
  period: string;
  title: string;
  /** `placeholder` eras render the "Awaiting foundation input" tag. */
  source: JourneySource;
  summary: string;
  what: string;
  why: string;
  community: string;
  /** Photo slot description — never a fabricated image. */
  media: string;
  links?: Array<{ href: string; label: string }>;
}

/**
 * The chronological timeline. Keep entries in story order — the page renders
 * them top to bottom with an alternating (desktop) / single-column (mobile) rail.
 */
export const JOURNEY_ERAS: JourneyEra[] = [
  {
    id: "beginnings",
    period: "[Founding year — to be confirmed]",
    title: "The very beginning",
    source: "placeholder",
    summary: "[Founder / Foundation story to be written here]",
    what: "[Add verified information about how Whispering Green Foundation started — the people involved, the first activity, and when it took place.]",
    why: "[Explain why this work mattered to the neighbourhood at the time.]",
    community: "[Describe who took part in the earliest work.]",
    media: "[Historical photographs — to be published once the foundation provides them with consent.]",
  },
  {
    id: "early-work",
    period: "[Period — to be confirmed]",
    title: "Early community work",
    source: "placeholder",
    summary: "[Add verified information about the foundation's early activities here.]",
    what: "[Which activities took place, in which localities, and over which period.]",
    why: "[What changed for residents as a result.]",
    community: "[The volunteers, households and local groups involved.]",
    media: "[Photographs or documents from this period.]",
  },
  {
    id: "field-collection",
    period: "August – September 2026",
    title: "Structured field collection",
    source: "verified",
    summary:
      "Door-to-door dry waste collection drives across Vasai-West, written into a field logbook with dates, localities and weighed quantities.",
    what:
      "Teams walked neighbourhood streets on collection rounds, gathered segregated dry waste, and weighed what was collected at the pickup point. Each round was written into the logbook as it happened rather than summarised from memory afterwards.",
    why:
      "A written, weighed record is what makes a community claim believable — and the locality-by-locality notes showed where the next rounds were most needed.",
    community:
      "This phase of the work was carried out as the community engagement project of a student team (CEP Phase II · Eco Engineering, Group 2).",
    media:
      "Illustrations from the gallery are used for now; no photographs from these rounds have been published yet.",
    links: [
      { href: "/about", label: "How our published numbers are made" },
      { href: "/awareness/the-logbook-behind-our-numbers", label: "Read: the logbook behind our numbers" },
    ],
  },
  {
    id: "public-workflow",
    period: "2026 – present",
    title: "Requests, coordination and verification",
    source: "verified",
    summary:
      "The work became organised around a public request workflow: any household can ask for a collection, the team reviews and schedules it, and what is collected is recorded and verified.",
    what:
      "Residents submit a collection request and receive a reference code they can use to follow progress. Coordinators review each request, approve it, agree a date, and record the collection — with a second check before any figure is published.",
    why:
      "Turning scattered drives into a request-based flow means no household has to wait for a drive to pass their street, and every published kilogram can be traced back to a weighing record.",
    community:
      "Requests come from households across Vasai-West; volunteers support the drives while coordinators handle review, scheduling and verification.",
    media: "Screens from the public request and tracking flow.",
    links: [
      { href: "/request-collection", label: "Request a collection" },
      { href: "/initiatives", label: "See current initiatives" },
    ],
  },
];

/** "Growth & community engagement" — only work this site can actually support. */
export interface JourneyPillar {
  icon: LucideIcon;
  title: string;
  text: string;
  href: string;
  cta: string;
  /** true when the pillar is backed by a live part of this platform. */
  live: boolean;
}

export const JOURNEY_PILLARS: JourneyPillar[] = [
  {
    icon: Truck,
    title: "Waste collection",
    text: "Household dry and plastic waste collected on request, weighed at the pickup point and recorded against a locality and a date.",
    href: "/request-collection",
    cta: "Request a collection",
    live: true,
  },
  {
    icon: Megaphone,
    title: "Environmental awareness",
    text: "Short, practical guidance on segregation, plastic and responsible disposal — written for Vasai-West households, not generalised advice.",
    href: "/awareness",
    cta: "Read the awareness portal",
    live: true,
  },
  {
    icon: Users,
    title: "Community participation",
    text: "Clean-up drives, segregation sessions and awareness walks that residents can simply turn up to and join.",
    href: "/events",
    cta: "Browse events",
    live: true,
  },
  {
    icon: HeartHandshake,
    title: "Volunteer involvement",
    text: "Volunteers register for an event in advance, so the team knows how many hands and how much material to plan for.",
    href: "/events",
    cta: "Register as a volunteer",
    live: true,
  },
  {
    icon: MapPin,
    title: "Local engagement",
    text: "Requests and records are tracked by locality, so it is visible which areas are taking part and where the next round is needed.",
    href: "/track-request",
    cta: "Track a request",
    live: true,
  },
  {
    icon: ListChecks,
    title: "Projects & initiatives",
    text: "Ongoing and completed work on the ground, each one with the verified collection records behind it.",
    href: "/initiatives",
    cta: "Browse initiatives",
    live: true,
  },
];

/**
 * "Where we are today" — the three-way distinction the page must never blur.
 * The live verified figure is fetched from the database by the page itself.
 */
export const JOURNEY_TODAY = {
  eyebrow: "Where we are today",
  title: "Today's work, and what the numbers actually mean",
  lead: "Whispering Green Foundation coordinates household waste collection and environmental awareness in Vasai-West. This platform supports that work — it does not replace it, and it does not create the impact.",
  distinctions: [
    {
      label: "Foundation activities",
      text: "Collection rounds, drives, awareness sessions and the coordination behind them — work done by people in the neighbourhood.",
    },
    {
      label: "Verified impact data",
      text: "Only weighed collection records that a second person has checked. Requests, drafts and unverified records are excluded from every public total, and only kilogram records are summed into the tonnage.",
    },
    {
      label: "Website functionality",
      text: "This site takes requests, tracks them by reference code, holds the collection records and publishes the verified figures. It is a record-keeping tool — the environmental work happens outside it.",
    },
  ],
} as const;

export const JOURNEY_NEXT = {
  eyebrow: "Looking ahead",
  title: "The Next Chapter",
  body: [
    "We continue to explore practical ways to strengthen community participation, improve coordination, and encourage responsible environmental action.",
    "What comes next will be shaped by the neighbourhood itself — which localities ask for collections, which habits stick, and which projects residents want to take on.",
  ],
  note: "We have deliberately not listed targets, dates, awards or partnerships on this page. When something is confirmed, it will be published here rather than promised in advance.",
  ctas: [
    { href: "/initiatives", label: "Explore our initiatives", variant: "primary" as const },
    { href: "/events", label: "Get involved", variant: "secondary" as const },
    { href: "/request-collection", label: "Request a collection", variant: "ghost" as const },
  ],
} as const;

/** Copy for the founder-note card when the founder has not published yet. */
export const FOUNDER_NOTE_EMPTY = {
  title: "[Founder: write your story here in your own words.]",
  hint: "Staff → Admin → Awareness content → new item with the category “Founder's story (Foundation Journey)”. It appears here as soon as it is published.",
} as const;
