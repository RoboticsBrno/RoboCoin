"use client";

import { useEffect, useState } from 'react';

interface InventoryItem {
	id: number;
	name: string;
	value: number;
	description: string;
}

export default function Inventory() {
	const [items, setItems] = useState<InventoryItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchInventory = async () => {
			const userID = localStorage.getItem('userID');

			if (!userID) {
				setError('Uživatel není přihlášen. Přihlaste se prosím.');
				setLoading(false);
				return;
			}

			try {
				/* const response = await fetch(`http://localhost:3000/api/inventory/${userID}`, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
				}); */

				// Mock response for now
				const response = {
					ok: true,
					json: async () => ({
						items: [
							{ id: 1, name: 'Úspěšná pomoc v kuchyni', value: 10, description: 'Úspěšně jsi pomohl v kuchyni a zajistil jídlo pro všechny účastníky!' },
							{ id: 2, name: 'Lekce 1', value: 20, description: 'Zvádl jsi překonat 1. lekci s Robůtkem!' },
						],
					}),
				};

				if (!response.ok) {
					throw new Error('Network response was not ok');
				}

				const data = await response.json();
				setItems(data.items);
			} catch (error) {
				console.error('Error fetching inventory:', error);
				setError('Chyba při načítání inventáře. Zkuste to prosím znovu později.');
			} finally {
				setLoading(false);
			}
		};

		fetchInventory();
	}, []);

	if (loading) {
		return <div className="container flex justify-center"><h1>Načítání...</h1></div>;
	}

	if (error) {
		return (
			<div className="container flex justify-center">
				<div className="text-red-500">{error}</div>
			</div>
		);
	}

	return (
		<div className="container flex flex-col items-center">
			<h1 className="text-2xl font-bold mb-4">Inventář</h1>
			<div className="space-y-4 w-full max-w-2xl">
				{items.map((item) => (
					<div key={item.id} className="border rounded-lg p-4 shadow-sm">
						<h2 className="text-xl font-semibold">{item.name}</h2>
						<p className="text-gray-600 mt-2">{item.description}</p>
						<p className="text-green-600 font-medium mt-2">
							Hodnota: {item.value} bodů
						</p>
					</div>
				))}
			</div>
		</div>
	);
}
