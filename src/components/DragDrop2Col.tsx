"use server";
import { AcquiredItem, Item } from '@/types/item';
import { User, UserInfo } from '@/types/user';
import { users } from '@/mock/users';
import { COOKIE_TOKEN } from '@/config';
import { getAllItems, getAllUsers, getItemUsers, getUserItems } from '@/lib/endpoints';
import { DragDrop2Col } from '@/components/DragDropBase';
import { cookies } from 'next/headers';
import { saveItemUsers, saveUserItems } from '@/actions/user-item-actions';

// Specialized wrapper components for easier usage
export async function DragDrop2ColForUser({ user, acquiredTitle, availableTitle }: {
	user: User;
	acquiredTitle?: string;
	availableTitle?: string;
}) {
	let acquiredItems: AcquiredItem[] = []; // Replace with actual data fetching
	let availableItems: Item[] = [];

	const cookieStore = await cookies();
	const token = cookieStore.get(COOKIE_TOKEN)?.value;
	try {
		acquiredItems = await getUserItems(user.id, token);
		console.log("Fetched acquired items for user:", user.id, acquiredItems);
	} catch (error) {
		console.error(error.message || String(error));
	}

	try {
		const allItems = await getAllItems(token);
		availableItems = allItems.filter(item => !acquiredItems.map(acq => acq.id).includes(item.id))
	} catch (error) {
		console.error(error.message || String(error));
	}

	const saveAction = saveUserItems.bind(null, user.id);

	return (
		<DragDrop2Col<Item>
			acquiredItems={acquiredItems}
			availableItems={availableItems}
			acquiredTitle={acquiredTitle}
			availableTitle={availableTitle}
			type="items"
			saveAction={saveAction}
		/>
	);
}

export async function DragDrop2ColForItem({ item, acquiredTitle, availableTitle }: {
	item: Item;
	acquiredTitle?: string;
	availableTitle?: string;
}) {
	let acquiredUsers: User[] = [];
	let availableUsers: User[] = [];

	const cookieStore = await cookies();
	const token = cookieStore.get(COOKIE_TOKEN)?.value;
	try {
		acquiredUsers = await getItemUsers(item.id, token);
		console.log("Fetched acquired users for item:", item.id, acquiredUsers);
	} catch (error) {
		console.error(error.message || String(error));
	}

	try {
		const allUsers = await getAllUsers(token);
		availableUsers = allUsers.filter(item => !acquiredUsers.map(acq => acq.id).includes(item.id))
	} catch (error) {
		console.error(error.message || String(error));
	}

	const saveAction = saveItemUsers.bind(null, String(item.id));

	return (
		<DragDrop2Col<User>
			acquiredItems={acquiredUsers}
			availableItems={availableUsers}
			acquiredTitle={acquiredTitle}
			availableTitle={availableTitle}
			type="users"
			saveAction={saveAction}
		/>
	);
}
