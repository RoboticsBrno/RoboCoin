"use client";

import { useState, useEffect } from "react";
import Card from "@/components/card/Card";
import PageTitle from "@/components/PageTitle";
import Loader from "@/components/Loader";
import { InventoryItem } from "@/lib/api";

interface Achievement {
	id: number;
	title: string;
	description: string | null;
	price: number;
	quantity: number;
}

export default function AchievementsPage() {
	const [achievements, setAchievements] = useState<Achievement[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchAchievements = async () => {
			try {
				const response = await fetch("/api/achievements");
				if (!response.ok) {
					throw new Error("Failed to fetch achievements");
				}
				const data: InventoryItem[] = await response.json();
				const parsedData: Achievement[] = data.map(
					(item: InventoryItem) => ({
						id: item.item_inventory_itemToitem.id,
						title: item.item_inventory_itemToitem.title,
						description:
							item.item_inventory_itemToitem.description || null,
						price: item.item_inventory_itemToitem.price,
						quantity: item.quantity || 1,
					})
				);
				setAchievements(parsedData);
			} catch (error) {
				console.error(error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchAchievements();
	}, []);

	return (
		<div className="container mx-auto px-4 py-8">
			<PageTitle>Your Achievements</PageTitle>
			{isLoading ? (
				<Loader />
			) : achievements.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
					{achievements.map((achievement) => (
						<Card key={achievement.id}>
							<h2 className="text-xl font-semibold text-white mb-2">
								{achievement.title}{" "}
								{achievement.quantity > 1 &&
									`(${achievement.quantity}x)`}
							</h2>
							<p className="text-gray-400 mb-4">
								{achievement.description ||
									"No description available"}
							</p>
							<p className="text-green-400 font-bold">
								Price: ${achievement.price.toFixed(2)}
							</p>
						</Card>
					))}
				</div>
			) : (
				<p className="text-center text-gray-400">
					You have not earned any achievements yet.
				</p>
			)}
		</div>
	);
}
