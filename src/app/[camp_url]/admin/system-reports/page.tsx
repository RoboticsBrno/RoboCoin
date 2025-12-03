"use client";

import Loader from "@/components/Loader";
import PageTitle from "@/components/PageTitle";
import { useToast } from "@/components/Toast";
import MenuCard from "@/components/card/MenuCard";
import { UserSelect } from "@/lib/api";
import { fetcher, FetchError } from "@/lib/fetch";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
	const params = useParams();
	const campUrl = params.camp_url;
	const [users, setUsers] = useState<UserSelect[]>([]);
	const [loading, setLoading] = useState(true);

	const { showError } = useToast();

	useEffect(() => {
		const fetchUsers = async () => {
			if (!campUrl) return;

			setLoading(true);
			try {
				const data = await fetcher<UserSelect[]>(
					`/api/users?camp_url=${campUrl}`
				);
				setUsers(data);
			} catch (error) {
				if (error instanceof FetchError) {
					showError(error.info.error || "Failed to fetch users");
				} else {
					showError(
						"An unexpected error occurred while fetching users."
					);
				}
				console.error("Error fetching users:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchUsers();
	}, [campUrl, showError]);

	return (
		<>
			<PageTitle>Přehled systému</PageTitle>
			<div className="container mx-auto px-4 py-8">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
					{loading ? (
						<Loader />
					) : users.length === 0 ? (
						<p className="text-center col-span-2">
							Žádní uživatelé k zobrazení.
						</p>
					) : (
						users.map((user) => (
							<MenuCard
								key={user.id}
								href={`/${campUrl}/admin/system-reports/${user.id}`}
								title={user.name || user.login}
								description={`Přehled pro uživatele ${user.login}`}
								type={
									user.user_camp_user_camp_userTouser[0]
										.is_admin
										? "admin"
										: user.user_camp_user_camp_userTouser[0]
													.is_org
											? "org"
											: undefined
								}
							/>
						))
					)}
				</div>
			</div>
		</>
	);
}
