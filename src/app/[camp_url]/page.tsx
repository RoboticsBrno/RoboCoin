"use client";

import { useParams } from "next/navigation";
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
	const params = useParams();

	const userCards: CardProps[] = [
		{
			title: "Achievements",
			description: "View all your camp achievements.",
			href: `${params.camp_url}/achievements`,
		},
		{
			title: "Marketplace",
			description: "Browse and purchase items from the marketplace.",
			href: `${params.camp_url}/marketplace`,
		},
		{
			title: "Send Money",
			description: "Transfer money to other people.",
			href: `${params.camp_url}/transfer`,
		},
		{
			title: "Transactions",
			description: "View your transaction history.",
			href: `${params.camp_url}/transactions`,
		},
		{
			title: "Your Items",
			description: "View and manage your items.",
			href: `${params.camp_url}/items`,
		},
	];
	const orgCards: CardProps[] = [
		{
			title: "Manage Achievements",
			description: "Add, edit, or delete achievements.",
			href: `${params.camp_url}/org/achievements`,
		},
		{
			title: "Achievement Table",
			description: "View achievement table.",
			href: `${params.camp_url}/org/achievement-table`,
		},
	];
	const adminCards: CardProps[] = [
		{
			title: "Manage Users",
			description: "Administer user accounts and permissions.",
			href: `${params.camp_url}/admin/manage-users`,
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
