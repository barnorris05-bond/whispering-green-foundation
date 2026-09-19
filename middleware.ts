import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge middleware: gate /admin pages and /api/admin APIs.
 * Definitive authorization happens server-side in each action/route (middleware
 * only sees cookie presence, not the DB), but this keeps casual probes out.
 */
export function middleware(req: NextRequest) {
  const hasSession = req.cookies.has("wgf_session");
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/api/admin") && !hasSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
