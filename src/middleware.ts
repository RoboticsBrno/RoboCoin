import { NextRequest as Request } from "next/server";
import { NextResponse as Response } from "next/server";

export function middleware(request: Request) {
	if (request.cookies.get("ID") && request.cookies.get("name")) {
		console.log("User is logged in.");
		return Response.next();
	}

	if (request.cookies.get("userID") && request.cookies.get("userName")) {
		console.log("User is logged in as user.");
		return Response.redirect(new URL("/", request.url), 302);
	}
	return Response.redirect(new URL("/login", request.url), 302);
}

export const config = {
	matcher: [
		'/api',
		'/dashboard',
		'/(items.*)',
		'/(users.*)',
	],
};
