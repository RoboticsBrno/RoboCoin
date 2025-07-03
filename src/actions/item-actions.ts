'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_TOKEN } from '@/config';
import { deleteItem, postItem, putItem } from '@/lib/endpoints';
import { Item } from '@/types/item';

export async function updateItemAction(formData: FormData) {
	const cookieStore = await cookies();
	const token = cookieStore.get(COOKIE_TOKEN)?.value;

	if (!token) {
		throw new Error('Unauthorized');
	}

	const id = Number(formData.get('id'));
	const updatedItem: Item = {
		id,
		name: formData.get('name') as string,
		description: formData.get('description') as string,
		price: parseInt(formData.get('value') as string),
	};
	console.log('Updating item:', updatedItem);
	try {
		await putItem(updatedItem, token);
	} catch (error) {
		console.error('Error updating item:', error);
		throw error;
	} finally {
		redirect('/items/' + id);
	}

}

export async function createItemAction(formData: FormData) {
	const cookieStore = await cookies();
	const token = cookieStore.get(COOKIE_TOKEN)?.value;

	if (!token) {
		throw new Error('Unauthorized');
	}

	const newItem: Item = {
		id: -1,
		name: formData.get('name') as string,
		description: formData.get('description') as string,
		price: parseInt(formData.get('value') as string),
	};
	console.log('Creating new item:', newItem);
	try {
		await postItem(newItem, token);
	} catch (error) {
		console.error('Error creating item:', error);
		throw error;
	} finally {
		redirect('/dashboard');
	}

}

export async function deleteItemAction(id: string) {
	const cookieStore = await cookies();
	const token = cookieStore.get(COOKIE_TOKEN)?.value;

	if (!token) {
		throw new Error('Unauthorized');
	}

	console.log('Deleting item with ID:', id);
	try {
		await deleteItem(id, token);
		redirect('/dashboard');
	} catch (error) {
		console.error('Error deleting item:', error);
		throw error;
	}
}
