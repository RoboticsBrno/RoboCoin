import { NextRequest as Request } from "next/server";
import { NextResponse as Response } from "next/server";
import { BACKEND_URL, COOKIE_NAME, COOKIE_TOKEN, COOKIE_USER_NAME, COOKIE_USER_TOKEN } from "./config";

export async function middleware(request: Request) {
	const url = new URL(BACKEND_URL + "/admin");

	const token = request.cookies.get(COOKIE_TOKEN)?.value || "";
	const isTokenValid = await fetch(url, {
		method: 'POST',
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${token}`,
		},
		body: token
	});

	if (!isTokenValid.ok) {
		console.error("Invalid token or not authorized");
		return Response.redirect(new URL("/login", request.url), 302);
	}

	const adminLogged = request.cookies.get(COOKIE_TOKEN) && request.cookies.get(COOKIE_NAME);


	const userLogged = request.cookies.get(COOKIE_USER_TOKEN) && request.cookies.get(COOKIE_USER_NAME);

	if (adminLogged) {
		return Response.next();
	}

	if (userLogged) {
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
