"use client";

import Loader from "@/components/Loader";
import PageTitle from "@/components/PageTitle";
import { useToast } from "@/components/Toast";
import MenuCard from "@/components/card/MenuCard";
import { useCurrencySymbol } from "@/hooks/useCurrencySymbol";
import { UserSelect } from "@/lib/api";
import { fetcher, FetchError } from "@/lib/fetch";
import { UserExtremes } from "@/types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
	const params = useParams();
	const campUrl = params.camp_url;
	const [users, setUsers] = useState<UserSelect[]>([]);
	const [loading, setLoading] = useState(true);
	const [currencyInCirculation, setCurrencyInCirculation] = useState<number>(0);
	const [wealthiestUsers, setWealthiestUsers] = useState<UserExtremes[]>([]);
	const [poorestUsers, setPoorestUsers] = useState<UserExtremes[]>([]);
	const campCurrency = useCurrencySymbol();

	const { showError } = useToast();

	useEffect(() => {
		const fetchUsers = async () => {
			if (!campUrl) return;

			setLoading(true);
			try {
				const data = await fetcher<UserSelect[]>(
					`/api/users?camp_url=${campUrl}`
				);
				let users = data.filter((user) => user.user_camp_user_camp_userTouser[0].is_admin).sort((a, b) => a.id - b.id);
				users = users.concat(data.filter((user) => user.user_camp_user_camp_userTouser[0].is_org && !user.user_camp_user_camp_userTouser[0].is_admin).sort((a, b) => a.id - b.id));
				users = users.concat(data.filter((user) => !user.user_camp_user_camp_userTouser[0].is_admin && !user.user_camp_user_camp_userTouser[0].is_org).sort((a, b) => a.id - b.id));
				setUsers(users);
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

	useEffect(() => {
		const fetchCurrencyInCirculation = async () => {
			if (!campUrl) return;

			try {
				const data = await fetcher<{ total: number }>(
					`/api/admin/circulation`
				);
				setCurrencyInCirculation(data.total);
			} catch (error) {
				if (error instanceof FetchError) {
					showError(
						error.info.error ||
						"Failed to fetch currency in circulation"
					);
				} else {
					showError(
						"An unexpected error occurred while fetching currency in circulation."
					);
				}
				console.error("Error fetching currency in circulation:", error);
			}
		};

		fetchCurrencyInCirculation();
	}, [campUrl, showError]);

	useEffect(() => {
		const fetchExtremes = async () => {
			if (!campUrl) return;

			try {
				const data = await fetcher<{
					wealthiest: UserExtremes[];
					poorest: UserExtremes[];
				}>(`/api/admin/extremes`);
				setWealthiestUsers(data.wealthiest);
				setPoorestUsers(data.poorest);
			} catch (error) {
				if (error instanceof FetchError) {
					showError(error.info.error || "Failed to fetch extremes");
				} else {
					showError(
						"An unexpected error occurred while fetching extremes."
					);
				}
				console.error("Error fetching extremes:", error);
			}
		};

		fetchExtremes();
	}, [campUrl, showError]);

	return (
		<>
			<PageTitle>Přehled systému</PageTitle>
			<div className="container mx-auto px-4 py-8">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 max-w-4xl mx-auto">
					<div className="block p-6 rounded-sm transition-colors duration-200 w-full bg-gray-800 text-white border border-gray-700 text-center">
						<h5 className="mb-2 text-2xl font-bold tracking-tight text-white">
							Měny mezi účastníky
						</h5>
						<h5 className="text-4xl font-bold text-green-400">
							{currencyInCirculation} {campCurrency}
						</h5>
					</div>

					<div className="block p-6 rounded-sm transition-colors duration-200 w-full bg-gray-800 text-white border border-gray-700">
						<h5 className="mb-2 text-2xl font-bold tracking-tight text-white text-center">
							Extrémy účastníků
						</h5>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<span>Nejbohatší uživatelé:</span>
								<ul className="mt-4 space-y-2">
									{wealthiestUsers.map((user) => (
										<li key={user.id} className="text-green-400">
											{user.name} ({user.login}): {user.balance} {campCurrency}
										</li>
									))}

								</ul>
							</div>
							<div>
								<span>Nejchudší uživatelé:</span>
								<ul className="mt-4 space-y-2">
									{poorestUsers.map((user) => (
										<li key={user.id} className="text-red-400">
											{user.name} ({user.login}): {user.balance} {campCurrency}
										</li>
									))}
								</ul>
							</div>
						</div>
					</div>
				</div>
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
			</div >
		</>
	);
}
