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
			title: "Úspěchy",
			description: "Zobrazit všechny úspěchy tábora.",
			href: `${params.camp_url}/achievements`,
		},
		{
			title: "Tržiště",
			description: "Procházejte a nakupujte předměty na tržišti.",
			href: `${params.camp_url}/marketplace`,
		},
		{
			title: "Poslat peníze",
			description: "Převádějte peníze ostatním lidem.",
			href: `${params.camp_url}/transfer`,
		},
		{
			title: "Transakce",
			description: "Zobrazit historii transakcí.",
			href: `${params.camp_url}/transactions`,
		},
		{
			title: "Vaše předměty",
			description: "Zobrazte a spravujte své předměty.",
			href: `${params.camp_url}/items`,
		},
	];
	const orgCards: CardProps[] = [
		{
			title: "Spravovat úspěchy",
			description: "Přidávejte, upravujte nebo mažte úspěchy.",
			href: `${params.camp_url}/org/achievements`,
			type: "org",
		},
		{
			title: "Tabulka úspěchů",
			description: "Zobrazit tabulku úspěchů.",
			href: `${params.camp_url}/org/achievement-table`,
			type: "org",
		},
	];
	const adminCards: CardProps[] = [
		{
			title: "Spravovat uživatele",
			description: "Spravujte uživatelské účty a oprávnění.",
			href: `${params.camp_url}/admin/manage-users`,
			type: "admin",
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
