"use client";

import Card from "@/components/Card";
import { useUserRole } from "@/hooks/useUserRole";

export default function Home() {
	return (
		<div className="min-h-screen bg-gray-900">
			<div className="container mx-auto p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
				<Card
					title="Inventory"
					description="Manage your inventory of robots and parts."
					href="/inventory"
				/>
				<Card
					title="Manage Items"
					description="Add, edit, or remove items from your inventory."
					href="/manage-items"
					type="org"
				/>
				<Card
					title="Manage Users"
					description="Administer user accounts and permissions."
					href="/manage-users"
					type="admin"
				/>
			</div>
		</div>
	);
}
