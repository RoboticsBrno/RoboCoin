"use server";

import { LoginResponseData } from "@/types/login";
import { cookies } from "next/headers";

export async function logout() {
	const cookieStore = await cookies();
	cookieStore.delete("ID");
	cookieStore.delete("name");
	cookieStore.delete("userID");
	cookieStore.delete("userName");
}

export async function login(username: string, password: string): Promise<LoginResponseData> {
	if (!username || !password) {
		throw new Error("Please fill in both fields.");
	}

	// For testing purposes
	if (username === "admin" && password === "admin") {
		const cookieStore = await cookies();
		cookieStore.set("ID", "test-id");
		cookieStore.set("name", "Test Admin");
		return { id: "test-id", name: "Test Admin" };
	}

	const response = await fetch("/api/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ username, password }),
	});
	if (!response.ok) {
		alert(response.error);
		throw new Error("Login failed");
	}

	const data = await response.json();
	const cookieStore = await cookies();
	cookieStore.set("ID", data.id);
	cookieStore.set("name", data.name);

	return data;
}

export async function loginUser(username: string, password: string): Promise<LoginResponseData> {
	if (!username || !password) {
		throw new Error("Please fill in both fields.");
	}

	if (username === "user" && password === "user") {
		const cookieStore = await cookies();
		cookieStore.set("userID", "test-id");
		cookieStore.set("userName", "Test User");
		return { id: "test-id", name: "Test User" };
	}

	const response = await fetch("/api/login_user", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ username, password }),
	});
	if (!response.ok) {
		alert(response.error);
		throw new Error("Login failed");
	}

	const data = await response.json();
	const cookieStore = await cookies();
	cookieStore.set("userID", data.id);
	cookieStore.set("userName", data.name);

	return data;
}

export async function TESTlogin() {
	const cookieStore = await cookies();
	cookieStore.set("ID", "test-id");
	cookieStore.set("name", "Test User");
	window.location.href = "/dashboard";
	return true;
}
