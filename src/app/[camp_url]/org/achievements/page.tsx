"use client";

import MenuCard from "@/components/card/MenuCard";
import PageTitle from "@/components/PageTitle";
import { useParams } from "next/navigation";

export default function ManageAchievementsPage() {
	const params = useParams();
	const campUrl = params.camp_url;
	return (
		<div className="container mx-auto px-4 py-8">
			<PageTitle>Spravovat úspěchy</PageTitle>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
				<MenuCard
					href={`/${campUrl}/org/achievements/new`}
					title="Vytvořit nový úspěch"
					description="Definujte nový úspěch, který lze udělit uživatelům, včetně jeho názvu a popisu."
				/>
				<MenuCard
					href={`/${campUrl}/org/achievements/to-user`}
					title="Udělit úspěchy uživateli"
					description="Udělejte úspěchy konkrétnímu uživateli."
				/>
				<MenuCard
					href={`/${campUrl}/org/achievements/to-achievement`}
					title="Přiřadit uživatele k úspěchu"
					description="Přiřaďte uživatele ke konkrétnímu úspěchu."
				/>
			</div>
		</div>
	);
}
