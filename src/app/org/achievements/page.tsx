"use client";

import MenuCard from "@/components/card/MenuCard";
import PageTitle from "@/components/PageTitle";

export default function ManageAchievementsPage() {
	return (
		<div className="container mx-auto px-4 py-8">
			<PageTitle>Manage Achievements</PageTitle>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
				<MenuCard
					href="/org/achievements/new"
					title="Create New Achievement"
					description="Define a new achievement that can be awarded to users, including its title and description."
				/>
				<MenuCard
					href="/org/achievements/to-user"
					title="Give Achievements to User"
					description="Award achievements to a specific user."
				/>
				<MenuCard
					href="/org/achievements/to-achievement"
					title="Assign Users to Achievement"
					description="Assign users to a specific achievement."
				/>
			</div>
		</div>
	);
}
