"use client";

import { useEffect, useState } from 'react';
import { Coins, Trophy, Sparkles, Medal } from 'lucide-react';

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
		<div className="min-h-screen min-w-full bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 p-6">
			<div className="container mx-auto max-w-6xl">
				<div className="text-center mb-12">
					<div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-8 py-4 shadow-2xl mb-6">
						<Coins className="text-yellow-500 text-3xl animate-spin" style={{ animationDuration: '3s' }} />
						<h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
							Tvůj Inventář
						</h1>
						<Trophy className="text-yellow-500 text-3xl animate-bounce" />
					</div>
					<p className="text-gray-600 text-lg">Zde jsou všechna tvá úžasná ocenění! 🌟</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{items.map((item) => (
						<div
							key={item.id}
							className="group relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-500 border border-white/20"
						>
							<div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
							<div className="relative">
								<div className="flex items-start justify-between mb-4">
									<h2 className="text-2xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">
										{item.name}
									</h2>
									<Sparkles className="text-yellow-500 animate-pulse" />
								</div>
								<p className="text-gray-600 text-lg mb-6 leading-relaxed">{item.description}</p>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
										<Coins className="text-lg" />
										<span>{item.value} bodů</span>
									</div>
									<Medal className="text-purple-500 text-2xl group-hover:animate-bounce" />
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
