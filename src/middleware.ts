import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const adminPaths = ["/admin"];

const orgPaths = ["/org"];

export async function middleware(req: NextRequest) {
	const session = await getToken({
		req,
		secret: process.env.NEXTAUTH_SECRET,
	});
	const { pathname } = req.nextUrl;

	if (
		!session &&
		pathname !== "/login" &&
		pathname !== "/unauthorized" &&
		pathname !== "/signup"
	) {
		const url = req.nextUrl.clone();
		url.pathname = "/login";
		return NextResponse.redirect(url);
	}

	const isAdminPath = adminPaths.some((path) => pathname.startsWith(path));
	const isOrgPath = orgPaths.some((path) => pathname.startsWith(path));

	if (!session && (isAdminPath || isOrgPath)) {
		const url = req.nextUrl.clone();
		url.pathname = "/login";
		return NextResponse.redirect(url);
	}

	if (session) {
		const isAdmin = session.is_admin;
		const isOrg = session.is_org;

		if (isAdminPath && !isAdmin) {
			const url = req.nextUrl.clone();
			url.pathname = "/unauthorized";
			return NextResponse.redirect(url);
		}

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
