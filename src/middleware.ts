import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
	const session = await getToken({
		req,
		secret: process.env.NEXTAUTH_SECRET,
	});
	const { pathname } = req.nextUrl;


	const pathSegments = pathname.split('/').filter(Boolean);
	const potentialCampUrl = pathSegments[0];

	const nonCampRoutes = ['login', 'signup', 'create-camp', 'unauthorized'];

	const isCampRoute = potentialCampUrl && !nonCampRoutes.includes(potentialCampUrl);

	if (isCampRoute) {
		const campUrl = potentialCampUrl;
		if (!session) {
			if (pathSegments[1] !== 'login' && pathSegments[1] !== 'signup') {
				const url = req.nextUrl.clone();
				url.pathname = `/${campUrl}/login`;
				return NextResponse.redirect(url);
			}
		} else {
			const managerPaths = ["create-camp", "add-managers", "manage-users"];
			const isManagerPath = pathSegments.some(segment => managerPaths.includes(segment));
			const isManager = session.is_manager;

			if (session.user_camps && !(session.user_camps as string[]).includes(campUrl) && (isManagerPath && !isManager)) {
				const url = req.nextUrl.clone();
				url.pathname = "/unauthorized";
				return NextResponse.redirect(url);
			}

			const isAdminPath = pathSegments.includes("admin");
			const isOrgPath = pathSegments.includes("org");
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

			if ((isManagerPath || pathname == '/') && !isManager) {
				const url = req.nextUrl.clone();
				url.pathname = "/unauthorized";
				return NextResponse.redirect(url);
			}
		}
	}
	else {
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

		const isManagerPath = pathname.includes("add-managers") || pathname.includes("create-camp") || pathname === "/";
		if (isManagerPath && session && !session.is_manager) {
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
