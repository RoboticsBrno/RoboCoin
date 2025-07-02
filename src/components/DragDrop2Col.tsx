"use client";
import { useDragAndDrop } from '@formkit/drag-and-drop/react';
import { Item } from '@/types/item';
import { User } from '@/types/user';
import { items } from '@/mock/items';
import { users } from '@/mock/users';
import { Gift, Users, Coins } from 'lucide-react';
import Button from '@/components/ui/Button';

interface DragDropConfig<T> {
	acquiredItems: T[];
	availableItems: T[];
	acquiredTitle?: string;
	availableTitle?: string;
	type?: 'items' | 'users';
	renderItem?: (item: T) => React.ReactNode;
}


export function DragDrop2Col<T extends { id: string }>({
	acquiredItems,
	availableItems,
	acquiredTitle = 'Získané odměny',
	availableTitle = 'Dostupné odměny',
	type = 'items',
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
		<div>
			<div className="text-center mb-8">
				<Button variant="success" className="text-xl px-8 py-4" onClick={handleSave}>
					💾 Uložit změny
				</Button>
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<DragDropList
					title={acquiredTitle}
					items={acquired}
					reference={acquiredList}
					render={type === 'users' ? renderUser : renderItem}
					type={type}
				/>
				<DragDropList
					title={availableTitle}
					items={available}
					reference={availableList}
					render={type === 'users' ? renderUser : renderItem}
					type={type}
				/>
			</div>
		</div>
	);
}

function renderUser(user: User) {
	return (
		<li
			key={user.id}
			className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-move border border-gray-100 hover:border-blue-200"
		>
			<div className="flex items-center gap-4">
				<div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
					{user.name.charAt(0)}
				</div>
				<div>
					<h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
						{user.name}
					</h3>
					<p className="text-gray-500">ID: {user.id}</p>
				</div>
			</div>
		</li>
	);
}


function renderItem(item: Item) {
	return (
		<li
			key={item.id}
			className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-move border border-gray-100 hover:border-purple-200"
		>
			<h4 className="font-bold text-gray-800">{item.name}</h4>
			{item.description && <p className="text-gray-600 text-sm mt-1">{item.description}</p>}
			{item.value && (
				<div className="flex items-center gap-1 mt-2 text-yellow-600 font-semibold">
					<Coins className="text-sm" />
					<span>{item.value} bodů</span>
				</div>
			)}
			{!item.value && <p className="text-gray-500 text-sm mt-1">ID: {item.id}</p>}
		</li>
	);
}

function DragDropList({ type, title, items, reference, render = renderItem }: { type: 'items' | 'users'; title: string; items: any[], reference: React.RefObject<HTMLUListElement>, render?: (item: any) => React.ReactNode }) {
	return (
		<div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
			<h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
				{type === 'items' ? <Gift className="text-purple-500" /> : <Users className="text-blue-500" />}
				{title}
			</h2>
			<ul ref={reference} className="space-y-3 min-h-[300px] bg-gray-50/50 rounded-xl p-4 border-2 border-dashed border-gray-200">
				{items.map(item => (
					render(item)
				))}
			</ul>
		</div>
	);
}

// Specialized wrapper components for easier usage
export function DragDrop2ColForUser({ user, acquiredTitle, availableTitle }: {
	user: User;
	acquiredTitle?: string;
	availableTitle?: string;
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
			acquiredTitle={acquiredTitle}
			availableTitle={availableTitle}
			type="items"
		/>
	);
}

export function DragDrop2ColForItem({ item, acquiredTitle, availableTitle }: {
	item: Item;
	acquiredTitle?: string;
	availableTitle?: string;
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
			acquiredTitle={acquiredTitle}
			availableTitle={availableTitle}
			type="users"
		/>
	);
}
