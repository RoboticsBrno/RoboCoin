"use server";

import { BACKEND_URL, COOKIE_NAME, COOKIE_TOKEN, COOKIE_USER_NAME, COOKIE_USER_TOKEN, ORG_NAME } from "@/config";
import { LoginBody } from "@/types/api";
import { LoginResponseData } from "@/types/login";
import { cookies } from "next/headers";

export async function logout() {
	const cookieStore = await cookies();
	cookieStore.delete(COOKIE_TOKEN);
	cookieStore.delete(COOKIE_NAME);
	cookieStore.delete(COOKIE_USER_TOKEN);
	cookieStore.delete(COOKIE_USER_NAME);
}

export async function login(email: string, password: string): Promise<LoginResponseData> {
	if (!email || !password) {
		throw new Error("Please fill in both fields.");
	}

	const body: LoginBody = {
		email,
		password,
	};

	const response = await fetch(BACKEND_URL + '/admin/login', {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});
	if (!response.ok) {
		console.error("Login failed:", response.statusText);
		throw new Error("Login failed: " + response.statusText);
	}


	const data = await response.json();
	const cookieStore = await cookies();

	cookieStore.set(COOKIE_TOKEN, data.token);
	cookieStore.set(COOKIE_NAME, ORG_NAME);

	const loginData: LoginResponseData = {
		token: data.token,
		name: ORG_NAME
	}
	return loginData
}

export async function loginUser(username: string): Promise<LoginResponseData> {
	if (!username) {
		throw new Error("Please fill in both fields.");
	}

	const response = await fetch(BACKEND_URL + '/login?name=' + username, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
	});
	console.log(response);
	if (!response.ok) {
		console.error("User login error: ", response.statusText);
		throw new Error("Login failed");
	}
	const data = await response.json();


	const cookieStore = await cookies();
	cookieStore.set(COOKIE_USER_TOKEN, data.id);
	cookieStore.set(COOKIE_USER_NAME, username);

	const loginData: LoginResponseData = {
		token: data.id,
		name: username
	}
	return loginData

}
