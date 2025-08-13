"use client";

import MenuCard from "@/components/card/MenuCard";
import { useUserRole } from "@/hooks/useUserRole";

interface CardProps {
	title: string;
	description: string;
	href: string;
	type?: "org" | "admin";
}

export default function Home() {
	const { is_org, is_admin } = useUserRole();

	const userCards: CardProps[] = [
		{
			title: "Achievements",
			description: "View all your camp achievements.",
			href: "/achievements",
		},
		{
			title: "Marketplace",
			description: "Browse and purchase items from the marketplace.",
			href: "/marketplace",
		},
		{
			title: "Send Money",
			description: "Transfer money to other people.",
			href: "/transfer",
		},
		{
			title: "Transactions",
			description: "View your transaction history.",
			href: "/transactions",
		},
		{
			title: "Your Items",
			description: "View and manage your items.",
			href: "/items",
		},
	];
	const orgCards: CardProps[] = [
		{
			title: "Manage Achievements",
			description: "Add, edit, or delete achievements.",
			href: "/org/achievements",
		},
		{
			title: "Achievement Table",
			description: "View achievement table.",
			href: "/org/achievement-table",
		},
	];
	const adminCards: CardProps[] = [
		{
			title: "Manage Users",
			description: "Administer user accounts and permissions.",
			href: "/admin/manage-users",
		},
		{
			title: "Add table import",
			description: "Import data from Google Sheets.",
			href: "/admin/import",
		},
	];

	return (
		<>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-gray-800 p-4 rounded-lg justify-items-center">
				{userCards.map((card) => (
					<MenuCard
						key={card.title}
						title={card.title}
						description={card.description}
						href={card.href}
					/>
				))}
			</div>
			{is_org && (
				<div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-blue-900 p-4 rounded-lg justify-items-center">
					{orgCards.map((card) => (
						<MenuCard
							key={card.title}
							title={card.title}
							description={card.description}
							href={card.href}
							type="org"
						/>
					))}
				</div>
			)}
			{is_admin && (
				<div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-red-900 p-4 rounded-lg justify-items-center">
					{adminCards.map((card) => (
						<MenuCard
							key={card.title}
							title={card.title}
							description={card.description}
							href={card.href}
							type="admin"
						/>
					))}
				</div>
			)}
		</>
	);
}
