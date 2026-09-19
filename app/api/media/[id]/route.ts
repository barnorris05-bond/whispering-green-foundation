import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const UPLOAD_ROOT = path.join(process.cwd(), process.env.UPLOAD_DIR ?? "uploads");

/** artwork:<key> storage paths are served from public/artwork (local SVG library, no DB bytes). */
const ARTWORK_DIR = path.join(process.cwd(), "public", "artwork");
const ARTWORK_KEYS = new Set([
  "river-cleanup",
  "sorting-station",
  "plant-drive",
  "plastic-press",
  "collect-van",
  "awareness-session",
]);

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const media = await prisma.media.findUnique({ where: { id } });

  // Public/approved media is public; pending/private requires staff session.
  if (!media) return new NextResponse("Not found", { status: 404 });
  if (media.visibility !== "approved") {
    const user = await getCurrentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });
  }

  // Local SVG artwork entries — served from public/artwork, never user-controlled paths.
  if (media.storagePath.startsWith("artwork:")) {
    const key = media.storagePath.slice("artwork:".length);
    if (!ARTWORK_KEYS.has(key)) return new NextResponse("Not found", { status: 404 });
    try {
      const buf = await readFile(path.join(ARTWORK_DIR, `${key}.svg`));
      return new NextResponse(new Uint8Array(buf), {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=3600",
        },
      });
    } catch {
      return new NextResponse("Not found", { status: 404 });
    }
  }

  const filePath = path.join(UPLOAD_ROOT, media.storagePath);
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(UPLOAD_ROOT))) {
    return new NextResponse("Invalid path", { status: 400 });
  }

  try {
    const buf = await readFile(resolved);
    const ext = path.extname(resolved).slice(1).toLowerCase();
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
