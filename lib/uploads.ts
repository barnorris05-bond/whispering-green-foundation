import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_ROOT = path.join(process.cwd(), process.env.UPLOAD_DIR ?? "uploads");
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export interface SaveResult {
  ok: boolean;
  path?: string;
  error?: string;
}

/** Validate and store an uploaded image locally. Returns relative path for DB. */
export async function saveUpload(file: File, prefix: string): Promise<SaveResult> {
  if (!file || typeof file === "string") return { ok: false, error: "No file provided." };
  if (file.size === 0) return { ok: false, error: "Empty file." };
  if (file.size > MAX_BYTES) return { ok: false, error: "Image is larger than 5 MB." };

  const ext = ALLOWED.get(file.type);
  if (!ext) return { ok: false, error: "Only JPG, PNG or WebP images are allowed." };

  const name = `${prefix}-${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const dir = path.join(UPLOAD_ROOT, prefix);
  const dest = path.join(dir, name);

  // path traversal guard: destination must stay under the uploads root
  const resolved = path.resolve(dest);
  if (!resolved.startsWith(path.resolve(UPLOAD_ROOT))) {
    return { ok: false, error: "Invalid file path." };
  }

  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(resolved, buffer);
  return { ok: true, path: `${prefix}/${name}` };
}
