"use client";
import { useDragAndDrop } from '@formkit/drag-and-drop/react';
import Button from 'react-bootstrap/esm/Button';
import { Item } from '@/types/item';
import { User } from '@/types/user';
import { items } from '@/mock/items';
import { users } from '@/mock/users';

interface DragDropConfig<T> {
	acquiredItems: T[];
	availableItems: T[];
	acquiredTitle: string;
	availableTitle: string;
	renderItem: (item: T) => React.ReactNode;
}

export function DragDrop2Col<T extends { id: string }>({
	acquiredItems,
	availableItems,
	acquiredTitle,
	availableTitle,
	renderItem,
}: DragDropConfig<T>) {
	const [acquiredList, acquired, setAcquired] = useDragAndDrop<HTMLUListElement, T>(
		acquiredItems,
		{ group: 'items', sortable: false }
	);

	const [availableList, available, setAvailable] = useDragAndDrop<HTMLUListElement, T>(
		availableItems,
		{ group: 'items', sortable: false }
	);

	const handleSave = () => {
		console.log('Acquired:', acquired);
		console.log('Available:', available);
	};

	return (
		<div className="flex flex-col mt-4">
			<Button variant='success' className='mb-3 mr-3 max-w-25' onClick={handleSave}>
				Uložit
			</Button>
			<div className="flex">
				<div className="w-1/2 pr-5">
					<h2 className="text-xl font-semibold mb-3">{acquiredTitle}</h2>
					<ul ref={acquiredList} className="list-none p-0 min-h-35">
						{acquired.map(item => (
							<div key={item.id}>
								{renderItem(item)}
							</div>
						))}
					</ul>
				</div>

				<div className="w-1/2 pl-5">
					<h2 className="text-xl font-semibold mb-3">{availableTitle}</h2>
					<ul ref={availableList} className="list-none p-0 min-h-35">
						{available.map(item => (
							<div key={item.id}>
								{renderItem(item)}
							</div>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
}

// Specialized wrapper components for easier usage
export function DragDrop2ColForUser({ user }: {
	user: User;
}) {
	// Get items for this user from server
	const acquiredItems: Item[] = [items[0]]; // Replace with actual data fetching
	const availableItems: Item[] = items.slice(1);

	const handleSave = (acquired: Item[], available: Item[]) => {
		console.log('Acquired Items:', acquired);
		console.log('Available Items:', available);
		// Default save logic here
	};

	return (
		<DragDrop2Col<Item>
			acquiredItems={acquiredItems}
			availableItems={availableItems}
			acquiredTitle="Získané položky"
			availableTitle="Dostupné položky"
			renderItem={(item) => <ItemCard item={item} />}
		/>
	);
}

export function DragDrop2ColForItem({ item }: {
	item: Item;
}) {
	// Get users for this item from server
	const acquiredItems: User[] = [users[0]]; // Replace with actual data fetching
	const availableItems: User[] = users.slice(1);

	const handleSave = (acquired: User[], available: User[]) => {
		console.log('Acquired Users:', acquired);
		console.log('Available Users:', available);
		// Default save logic here
	};

	return (
		<DragDrop2Col<User>
			acquiredItems={acquiredItems}
			availableItems={availableItems}
			acquiredTitle="Přiřazení uživatelé"
			availableTitle="Dostupní uživatelé"
			renderItem={(user) => <UserCard user={user} />}
		/>
	);
}

function ItemCard({ item }: { item: Item }) {
	return (
		<li className="mb-2 border-1 border-neutral-400 rounded-md px-3 py-2">
			<h3 className="font-bold">{item.name}</h3>
			<p>{item.description}</p>
			<p>Hodnota: {item.value}</p>
		</li>
	);
}

function UserCard({ user }: { user: User }) {
	return (
		<li className="mb-2 border-1 border-neutral-400 rounded-md px-3 py-2">
			<h3 className="font-bold">{user.name}</h3>
			<p>Uživatel ID: {user.id}</p>
		</li>
	);
}
