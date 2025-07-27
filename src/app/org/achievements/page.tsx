"use client";

import Card from "@/components/Card";

export default function ManageAchievementsPage() {
	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-4xl font-bold text-white mb-8 text-center">
				Manage Achievements
			</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
				<Card
					href="/org/achievements/new"
					title="Create New Achievement"
					description="Define a new achievement that can be awarded to users, including its title and description."
				/>
				<Card
					href="/org/achievements/to-user"
					title="Give Achievements to User"
					description="Award achievements to a specific user."
				/>
				<Card
					href="/org/achievements/to-achievement"
					title="Assign Users to Achievement"
					description="Assign users to a specific achievement."
				/>
			</div>
		</div>
	);
}
