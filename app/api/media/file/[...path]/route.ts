import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getCurrentUser } from "@/lib/auth";

const UPLOAD_ROOT = path.join(process.cwd(), process.env.UPLOAD_DIR ?? "uploads");

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

/**
 * Staff-only raw file access (used for resident request photos in the admin).
 * Any authenticated staff session is required — residents' photos must never be
 * publicly reachable, unlike /api/media/[id] which honours media visibility.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { path: parts } = await params;
  const rel = parts.join("/");
  const filePath = path.join(UPLOAD_ROOT, rel);
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(UPLOAD_ROOT) + path.sep)) {
    return new NextResponse("Invalid path", { status: 400 });
  }

  const ext = path.extname(resolved).slice(1).toLowerCase();
  if (!MIME[ext]) return new NextResponse("Not found", { status: 404 });

  try {
    const buf = await readFile(resolved);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": MIME[ext],
        "Cache-Control": "private, no-store",
        "Content-Disposition": "inline",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
