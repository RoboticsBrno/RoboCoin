"use client";

import { createContext, useContext } from 'react';
import { Item } from '@/types/item';

const ItemContext = createContext<Item | null>(null);

export function ItemProvider({ item, children }: { item: Item | null; children: React.ReactNode }) {
	return (
		<ItemContext.Provider value={item}>
			{children}
		</ItemContext.Provider>
	);
}

export function useItem() {
	const context = useContext(ItemContext);

	return context;
}
