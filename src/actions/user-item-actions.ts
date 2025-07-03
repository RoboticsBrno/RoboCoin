'use server';

import { cookies } from "next/headers";
import { COOKIE_TOKEN } from "@/config";
import { putItemUsers, putUserItems } from "@/lib/endpoints";
import { redirect } from "next/navigation";

export async function saveUserItems(userId: string, ids: number[]) {
	const cookieStore = await cookies();
	const token = cookieStore.get(COOKIE_TOKEN)?.value;

	try {
		await putUserItems(userId, ids, token);
		return { success: true };
	} catch (error) {
		console.error(error.message || String(error));
		return { success: false, error: error.message || String(error) };
	} finally {
		redirect("/users/" + userId);
	}
}
export async function saveItemUsers(itemId: string, ids: number[]) {
	const cookieStore = await cookies();
	const token = cookieStore.get(COOKIE_TOKEN)?.value;

	try {
		await putItemUsers(itemId, ids, token);
		return { success: true };
	} catch (error) {
		console.error(error.message || String(error));
		return { success: false, error: error.message || String(error) };
	} finally {
		redirect("/items/" + itemId);
	}
}
