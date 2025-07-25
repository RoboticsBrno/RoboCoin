import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

// Admin-only routes
const adminPaths = ["/admin"];

// Organization-only routes (admins also have access)
const orgPaths = ["/dashboard", "/events/new"];

export async function middleware(req: NextRequest) {
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isAdminPath = adminPaths.some((path) => pathname.startsWith(path));
  const isOrgPath = orgPaths.some((path) => pathname.startsWith(path));

  // If user is not logged in, redirect to login for protected routes
  if (!session && (isAdminPath || isOrgPath)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (session) {
    const isAdmin = session.is_admin;
    const isOrg = session.is_org;

    // Protect admin routes
    if (isAdminPath && !isAdmin) {
      const url = req.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }

    // Protect org routes
    // Admins have access to org routes as well
    if (isOrgPath && !isOrg && !isAdmin) {
      const url = req.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
