"use client";

import PageTitle from "@/components/PageTitle";
import MenuCard from "@/components/card/MenuCard";
import { useParams } from "next/navigation";

export default function Page() {
	const params = useParams();
	const campUrl = params.camp_url;
	return (
		<>
			<PageTitle>Spravovat uživatele</PageTitle>
			<div className="container mx-auto px-4 py-8">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
					<MenuCard
						href={`/${campUrl}/admin/manage-users/new`}
						title="Vytvořit nového uživatele"
						description="Přidejte do systému nového uživatele s jeho údaji."
					/>
					<MenuCard
						href={`/${campUrl}/admin/manage-users/edit`}
						title="Upravit stávajícího uživatele"
						description="Upravte podrobnosti o stávajícím uživateli."
					/>
					<MenuCard
						href={`/${campUrl}/admin/manage-users/delete`}
						title="Smazat uživatele"
						description="Odeberte uživatele ze systému."
					/>
				</div>
			</div>
		</>
	);
}
