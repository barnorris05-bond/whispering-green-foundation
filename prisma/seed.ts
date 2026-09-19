/**
 * Seed script — Whispering Green Foundation (localhost demo).
 *
 * Data policy:
 *  - The ONLY source-derived collection figures come from the CEP Phase II Logbook
 *    (Eco Engineering, Group 2) as quoted by the project brief: 500 kg (22 Aug 2026),
 *    350 kg (29 Aug 2026), 220 kg (13 Sep 2026), plus a stated "720 kg" total for
 *    Weeks 5 & 7 that does NOT match the sum of the individual entries (1070 kg).
 *    The brief explicitly says not to reconcile this discrepancy, so those rows are
 *    inserted as *unverified* (draft + needsVerification + isLogbookSeed) and are
 *    EXCLUDED from all public impact numbers until staff verify them in the admin UI.
 *  - Everything else (people, emails, phones, addresses) is fictional sample data
 *    clearly labelled as demo seed.
 *
 * Usage: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import { randomBytes, scrypt as _scrypt } from "crypto";
import { promisify } from "util";
import { GALLERY_ARTWORKS } from "../components/artwork";

const scrypt = promisify(_scrypt) as (p: string, s: string, k: number) => Promise<Buffer>;

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64);
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

async function main() {
  console.log("🌱 Seeding Whispering Green Foundation demo data…\n");

  // ---------------------------------------------------------------- users
  const founderHash = await hashPassword("Founder@123");
  const staffHash = await hashPassword("Staff@123");

  const founder = await prisma.user.upsert({
    where: { email: "founder@wgf.demo" },
    update: {},
    create: {
      name: "Demo Founder",
      email: "founder@wgf.demo",
      passwordHash: founderHash,
      role: "founder",
      mustChangePassword: true,
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: "staff@wgf.demo" },
    update: {},
    create: {
      name: "Demo Staff",
      email: "staff@wgf.demo",
      passwordHash: staffHash,
      role: "staff",
      mustChangePassword: true,
    },
  });

  // ---------------------------------------------------------------- settings
  await prisma.foundationSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      displayName: "Whispering Green Foundation",
      tagline: "Community-led waste collection and awareness in Vasai-West",
      contactEmail: null, // deliberately blank — shown as placeholder until staff set it
      contactPhone: null,
      publicLocation: "Vasai-West, Palghar, Maharashtra",
      footerNote: null,
    },
  });

  // ---------------------------------------------------------------- projects
  const projectDefs = [
    {
      title: "Household Dry Waste Collection Drive",
      category: "waste",
      locality: "Vasai-West (general)",
      description:
        "Door-to-door collection of dry recyclable waste from participating households in Vasai-West. Collected waste is weighed, recorded and routed to authorised recyclers. This project hosts the CEP Phase II collection activities documented in the group logbook.",
      status: "active",
      visibility: "published",
      startDate: new Date("2026-08-01"),
    },
    {
      title: "Segregation Awareness Sessions",
      category: "education",
      locality: "Vasai-West (general)",
      description:
        "Short community sessions on separating wet and dry waste at home, reducing plastic use, and preparing recyclables for collection. Sessions are informal and open to all residents.",
      status: "active",
      visibility: "published",
      startDate: new Date("2026-08-15"),
    },
    {
      title: "Clean-up Drives",
      category: "cleanup",
      locality: "Bhabola",
      description:
        "Periodic public-area clean-up drives organised with resident volunteers. Placeholder concept project for the demo — attach events and verified records to it.",
      status: "draft",
      visibility: "draft",
    },
  ];

  const projects: Record<string, { id: string }> = {};
  for (const p of projectDefs) {
    const slug = slugify(p.title);
    projects[p.title] = await prisma.project.upsert({
      where: { slug },
      update: {},
      create: { ...p, slug },
    });
  }

  // ---------------------------------------------------------------- events
  const now = new Date();
  const inDays = (n: number) => new Date(now.getTime() + n * 86400000);
  const atNoon = (d: Date) => {
    const x = new Date(d);
    x.setHours(12, 0, 0, 0);
    return x;
  };

  const eventDefs = [
    {
      title: "Weekend Clean-up Drive — Bhabola",
      description:
        "Join volunteers for a morning clean-up of the Bhabola market street, followed by waste segregation and weighing. Gloves and bags provided. Sample event for demonstration.",
      eventDate: atNoon(inDays(10)),
      startTime: "08:00",
      endTime: "11:00",
      locality: "Bhabola",
      status: "published",
      capacity: 40,
      registrationDeadline: inDays(8),
    },
    {
      title: "Home Segregation Workshop",
      description:
        "A hands-on workshop showing how to set up two-bin segregation at home and prep dry recyclables for collection. Sample event for demonstration.",
      eventDate: atNoon(inDays(24)),
      startTime: "10:00",
      endTime: "12:00",
      locality: "Navghar Road",
      status: "published",
      capacity: null,
      registrationDeadline: inDays(21),
    },
    {
      title: "Plastic-free Market Walk (draft)",
      description:
        "Draft awareness walk concept — not yet published. Visible to staff only.",
      eventDate: atNoon(inDays(40)),
      startTime: "07:30",
      endTime: null,
      locality: "Chulne",
      status: "draft",
      capacity: null,
      registrationDeadline: null,
    },
  ];

  for (const e of eventDefs) {
    const slug = slugify(e.title);
    await prisma.event.upsert({
      where: { slug },
      update: {},
      create: { ...e, slug, createdById: staff.id },
    });
  }

  // ---------------------------------------------------------------- articles
  const articleDefs = [
    {
      title: "Wet waste vs dry waste: a two-bin start",
      category: "waste_segregation",
      excerpt: "The simplest segregation habit that makes every later step easier.",
      body: `Most household waste falls into two broad streams: wet (food and garden waste) and dry (paper, plastic, metal, glass).

Start with two bins:
- Wet bin: food scraps, peels, cooked waste. Keep it covered and empty it daily.
- Dry bin: clean and dry packaging, paper, cardboard, bottles.

Why it matters: mixed waste is hard to recycle. When recyclables are soiled by food waste, they often end up in landfill. A clean, dry bag of recyclables can actually be recycled.

This article is sample awareness content for the demo platform.`,
      readMinutes: 3,
    },
    {
      title: "Five plastic items you can swap this week",
      category: "plastic_awareness",
      excerpt: "Small swaps that cut plastic at the source — no perfection required.",
      body: `Plastic reduction works best when it fits your routine. Five practical swaps:

1. Carry a cloth bag for vegetable shopping.
2. Refuse single-use cutlery when ordering in.
3. Use a refillable water bottle.
4. Choose bar soap or refill packs where available.
5. Store leftovers in reusable containers instead of cling film.

None of these require special equipment. Start with the one that feels easiest.

This article is sample awareness content for the demo platform.`,
      readMinutes: 3,
    },
    {
      title: "How to prepare recyclables for collection",
      category: "recycling",
      excerpt: "Rinse, dry, sort — three words that raise the value of every kilogram.",
      body: `Before handing recyclables to any collector:

- Rinse containers briefly so no food residue remains.
- Let them dry — moisture ruins paper and invites odour.
- Flatten cartons and bottles to save space.
- Keep glass separate if possible; it breaks and contaminates other streams.
- Bag them clearly so sorting takes seconds.

Clean recyclables are more likely to actually be recycled instead of being diverted to landfill.

This article is sample awareness content for the demo platform.`,
      readMinutes: 3,
    },
    {
      title: "Where broken electronics should (and should not) go",
      category: "responsible_disposal",
      excerpt: "E-waste contains materials that must not enter the regular waste stream.",
      body: `Old chargers, dead bulbs, broken earphones — these are e-waste, not dry waste.

- Do not mix them with household waste bags.
- Do not burn or break them open.
- Store them in a box until your municipal e-waste collection day or an authorised recycler drop-off point.

This article is sample awareness content for the demo platform and is not an official disposal instruction.`,
      readMinutes: 3,
    },
    {
      title: "What a community clean-up actually involves",
      category: "community_action",
      excerpt: "A realistic walkthrough of a two-hour drive, start to finish.",
      body: `A typical drive looks like this:

- 08:00 — volunteers gather, gloves and bags distributed, safety briefing.
- 08:15 — teams cover assigned streets; a van follows for filled bags.
- 09:45 — collected waste is brought to a common point.
- 10:00 — waste is segregated and weighed; totals are recorded.
- 10:30 — wrap-up and photo.

The weighing step is the one that turns effort into evidence: it is how verified impact figures are produced on this platform.

This article is sample awareness content for the demo platform.`,
      readMinutes: 3,
    },
    {
      title: "The logbook behind our numbers",
      category: "community_action",
      excerpt: "How CEP Phase II field entries become verified collection records — and why some totals wait.",
      body: `Every collection figure published on this platform starts life in a field logbook: date, locality, category, weighing method, quantity.

A logbook entry only becomes a published impact number after a coordinator re-checks it against the weighing records and marks it verified. Until then it stays unverified and is deliberately excluded from public totals.

The CEP Phase II (Eco Engineering, Group 2) logbook contains entries from the August–September 2026 collection weeks. A stated weekly total in the source does not match the sum of its individual entries, so those rows are imported but left unverified until the team resolves the source discrepancy.

That is intentional: transparency about uncertainty beats a confident wrong number.`,
      readMinutes: 4,
    },
  ];

  for (const a of articleDefs) {
    const slug = slugify(a.title);
    await prisma.content.upsert({
      where: { slug },
      update: {},
      create: { ...a, slug, status: "published", authorId: staff.id, publishedAt: now },
    });
  }

  // ----------------------------------------------------------------
  // Gallery seed — local SVG artwork entries (clearly-labelled concepts)
  // ----------------------------------------------------------------
  for (const art of GALLERY_ARTWORKS) {
    await prisma.media.upsert({
      where: { storagePath: `artwork:${art.key}` },
      update: {},
      create: {
        storagePath: `artwork:${art.key}`,
        caption: `${art.caption} (illustration concept, not a photograph)`,
        altText: art.alt,
        attribution: "WGF placeholder artwork",
        visibility: "approved",
        uploadedById: staff.id,
      },
    });
  }

  // ----------------------------------------------------------------
  // CEP logbook collection records — UNVERIFIED, excluded from public impact
  // ----------------------------------------------------------------
  const mainProject = projects["Household Dry Waste Collection Drive"].id;

  const logbookRecords = [
    { date: new Date("2026-08-22T00:00:00"), quantity: 500, note: "CEP logbook entry — Week 5 per brief (22 Aug 2026). Quantity needs source verification." },
    { date: new Date("2026-08-29T00:00:00"), quantity: 350, note: "CEP logbook entry — Week 6/7 boundary per brief (29 Aug 2026). Quantity needs source verification." },
    { date: new Date("2026-09-13T00:00:00"), quantity: 220, note: "CEP logbook entry — Week 7 per brief (13 Sep 2026). Quantity needs source verification." },
  ];

  for (const r of logbookRecords) {
    const existing = await prisma.collectionRecord.findFirst({
      where: { collectionDate: r.date, isLogbookSeed: true },
    });
    if (!existing) {
      await prisma.collectionRecord.create({
        data: {
          collectionDate: r.date,
          locality: "Vasai-West (general)",
          category: "dry_recyclable",
          quantity: r.quantity,
          unit: "kg",
          measurementType: "measured",
          verificationStatus: "draft", // ← deliberately NOT verified
          notes: r.note,
          recordedById: staff.id,
          projectId: mainProject,
          source: "logbook",
          isLogbookSeed: true,
          needsVerification: true,
        },
      });
    }
  }

  // ----------------------------------------------------------------
  // Demo verified record — clearly sample, to make the impact pipeline visible
  // ----------------------------------------------------------------
  const demoDate = new Date(now.getTime() - 7 * 86400000);
  demoDate.setHours(0, 0, 0, 0);
  const demoExists = await prisma.collectionRecord.findFirst({
    where: { isLogbookSeed: false, notes: { contains: "DEMO SAMPLE" } },
  });
  if (!demoExists) {
    await prisma.collectionRecord.create({
      data: {
        collectionDate: demoDate,
        locality: "Bhabola",
        category: "plastic",
        quantity: 42.5,
        unit: "kg",
        measurementType: "measured",
        verificationStatus: "verified",
        notes: "DEMO SAMPLE — fictional verified record created by seed so the impact pipeline can be demonstrated. Not real data.",
        recordedById: staff.id,
        projectId: mainProject,
        source: "field",
      },
    });
  }

  // ----------------------------------------------------------------
  // Sample requests (one submitted, one completed for the demo flow)
  // ----------------------------------------------------------------
  const sampleRequests = [
    {
      referenceCode: "WGF-DEMO-0001",
      name: "Sample Resident A",
      email: "resident1@example.com",
      phone: "+91 90000 00001",
      category: "plastic",
      description: "Around 4 bags of clean, dry plastic packaging accumulated over a month. Sample request created by seed.",
      quantity: 6,
      unit: "bags",
      locality: "Bhabola",
      address: "DEMO SAMPLE — fictional address, plot 12, lane 3 (seed data)",
      status: "submitted",
    },
    {
      referenceCode: "WGF-DEMO-0002",
      name: "Sample Resident B",
      email: "resident2@example.com",
      phone: "+91 90000 00002",
      category: "dry_recyclable",
      description: "Paper, cardboard and glass bottles stored in the society utility room. Sample request created by seed.",
      quantity: 15,
      unit: "kg",
      locality: "Navghar Road",
      address: "DEMO SAMPLE — fictional society office, Navghar Road (seed data)",
      status: "completed",
      scheduledDate: inDays(-5),
    },
  ];

  for (const r of sampleRequests) {
    await prisma.collectionRequest.upsert({
      where: { referenceCode: r.referenceCode },
      update: {},
      create: {
        ...r,
        scheduledDate: r.scheduledDate ?? null,
      },
    });
  }

  // history entries for the completed sample request
  const demoReq = await prisma.collectionRequest.findUnique({ where: { referenceCode: "WGF-DEMO-0002" } });
  if (demoReq && (await prisma.requestStatusHistory.count({ where: { requestId: demoReq.id } })) === 0) {
    await prisma.requestStatusHistory.createMany({
      data: [
        { requestId: demoReq.id, oldStatus: null, newStatus: "submitted", note: "Request submitted by resident." },
        { requestId: demoReq.id, oldStatus: "submitted", newStatus: "under_review", changedBy: staff.id, note: "Details look complete; calling to confirm." },
        { requestId: demoReq.id, oldStatus: "under_review", newStatus: "scheduled", changedBy: staff.id, note: "Pickup scheduled for Saturday morning." },
        { requestId: demoReq.id, oldStatus: "scheduled", newStatus: "in_progress", changedBy: staff.id, note: "Van dispatched." },
        { requestId: demoReq.id, oldStatus: "in_progress", newStatus: "completed", changedBy: staff.id, note: "Collected and weighed on-site." },
      ],
    });
  }

  // volunteer registrations
  const driveEvent = await prisma.event.findUnique({ where: { slug: slugify("Weekend Clean-up Drive — Bhabola") } });
  if (driveEvent) {
    await prisma.volunteerRegistration.upsert({
      where: { eventId_email: { eventId: driveEvent.id, email: "volunteer1@example.com" } },
      update: {},
      create: {
        eventId: driveEvent.id,
        name: "Sample Volunteer",
        email: "volunteer1@example.com",
        phone: "+91 90000 00003",
      },
    });
  }

  // contact message
  await prisma.contactMessage.upsert({
    where: { id: "seed-message-1" },
    update: {},
    create: {
      id: "seed-message-1",
      name: "Sample Resident C",
      email: "resident3@example.com",
      subject: "Does collection cover my lane?",
      message: "DEMO SAMPLE — Hi, I live near the Chulne market. Do you pick up from there? Thanks!",
    },
  }).catch(() => {});

  console.log("✅ Seed complete.\n");
  console.log("   Demo accounts:");
  console.log("   • Founder: founder@wgf.demo / Founder@123");
  console.log("   • Staff:   staff@wgf.demo   / Staff@123");
  console.log("\n   Logbook records (500/350/220 kg + demo sample) are seeded UNVERIFIED.");
  console.log("   Verify them in Admin → Collections to see public impact change.\n");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
