"use client";

import { useState, useEffect } from "react";
import Card from "@/components/Card";

// Define the type for a single achievement based on the API response
interface Achievement {
	id: number;
	item: {
		id: number;
		title: string;
		description: string | null;
	};
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
				const data = await response.json();
				setAchievements(data);
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
			<h1 className="text-4xl font-bold text-white mb-8 text-center">
				Your Achievements
			</h1>
			{isLoading ? (
				<p className="text-center text-gray-400">
					Loading achievements...
				</p>
			) : achievements.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
					{achievements.map((achievement) => (
						<Card
							key={achievement.id}
							href="#" // Achievements don't link anywhere for now
							title={achievement.item.title}
							description={
								achievement.item.description ||
								"No description available."
							}
						/>
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
