"use client";

import Loader from "@/components/Loader";
import PageTitle from "@/components/PageTitle";
import { useToast } from "@/components/Toast";
import { UserSelect } from "@/lib/api";
import { fetcher, FetchError } from "@/lib/fetch";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Balance, Item } from "@/types";
import { TransactionWithUsers } from "@/lib/transactions";
import TransactionsTable from "@/components/TransactionsTable";
import Card from "@/components/card/Card";
import Button from "@/components/Button";
import { useCurrencySymbol } from "@/hooks/useCurrencySymbol";

interface UserReportData {
	user: UserSelect;
	balance: number;
	transactions: TransactionWithUsers[];
	inventory: Item[];
	achievements: Item[];
}

export default function Page() {
	const params = useParams();
	const campUrl = params.camp_url as string;
	const userId = params.user_id as string;
	const [data, setData] = useState<UserReportData | null>(null);
	const [loading, setLoading] = useState(true);

	const campCurrency = useCurrencySymbol();

	const { showError, showSuccess } = useToast();

	const [balanceAmount, setBalanceAmount] = useState<number>(0);

	const handleBalanceUpdate = async (
		type: "add" | "subtract" | "set",
		amount: number
	) => {
		if (isNaN(amount) || !Number.isInteger(amount)) {
			showError("Zadejte prosím platné celé číslo.");
			return;
		}

		if (amount < 0) {
			showError("Částka nemůže být záporná.");
			return;
		}

		if (type !== "set" && amount === 0) {
			showError("Částka pro přičtení/odečtení musí být větší než 0.");
			return;
		}

		try {
			const updatedBalance: { amount: number } = await fetcher(
				`/api/admin/users/${userId}/balance`,
				{
					method: "PUT",
					body: JSON.stringify({ type, amount, campUrl }),
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
			showSuccess(`Zůstatek aktualizován: ${type} ${amount} ${campCurrency}`);
			if (data) {
				setData({
					...data,
					balance: updatedBalance.amount,
				});
			}
			setBalanceAmount(0);
		} catch (error) {
			if (error instanceof FetchError) {
				showError(error.info.error || `Nepodařilo se ${type} zůstatek`);
			} else {
				showError(
					`Při ${type} zůstatku došlo k neočekávané chybě.`
				);
			}
			console.error(`Chyba při ${type} zůstatku:`, error);
		}
	};

	const fetchUserData = async () => {
		if (!campUrl || !userId) return;

		setLoading(true);
		try {
			const [
				userData,
				balanceData,
				transactionsData,
				inventoryData,
				achievementsData,
			] = await Promise.all([
				fetcher<UserSelect[]>(`/api/users?camp_url=${campUrl}`),
				fetcher<Balance>(
					`/api/admin/users/${userId}/balance?camp_url=${campUrl}`
				),
				fetcher<TransactionWithUsers[]>(
					`/api/admin/users/${userId}/transactions?camp_url=${campUrl}`
				),
				fetcher<Item[]>(
					`/api/admin/users/${userId}/inventory?camp_url=${campUrl}`
				),
				fetcher<Item[]>(
					`/api/admin/users/${userId}/achievements?camp_url=${campUrl}`
				),
			]);

			const foundUser = userData.find((u) => u.id === Number(userId));
			console.log(transactionsData);
			if (foundUser) {
				setData({
					user: foundUser,
					balance: balanceData.amount,
					transactions: transactionsData,
					inventory: inventoryData,
					achievements: achievementsData,
				});
			} else {
				showError("Uživatel nenalezen.");
			}
		} catch (error) {
			if (error instanceof FetchError) {
				showError(error.info.error || "Nepodařilo se načíst data uživatele");
			} else {
									showError("Při načítání dat uživatele došlo k neočekávané chybě.");
			}
			console.error("Error fetching user data:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleRefund = async (transactionId: number) => {
		if (
			window.confirm("Opravdu chcete vrátit tuto transakci?")
		) {
			try {
				await fetcher(
					`/api/admin/transactions/${transactionId}/refund`,
					{
						method: "POST",
					}
				);
				showSuccess("Transakce byla úspěšně vrácena.");
				fetchUserData();
			} catch (error) {
				if (error instanceof FetchError) {
					showError(
						error.info.error || "Nepodařilo se vrátit transakci"
					);
				} else {
					showError("Při vracení peněz došlo k neočekávané chybě.");
				}
				console.error("Chyba při vracení transakce:", error);
			}
		}
	};

	useEffect(() => {
		fetchUserData();
	}, [campUrl, userId, showError]);

	const userRoles = data?.user
		? [
				data.user.user_camp_user_camp_userTouser[0].is_admin
					? "Admin"
					: null,
				data.user.user_camp_user_camp_userTouser[0].is_org
					? "Org"
					: null,
			]
				.filter(Boolean)
				.join(", ")
		: "";

	return (
		<>
			<PageTitle>Přehled uživatele {data?.user?.name}</PageTitle>
			<div className="container mx-auto px-4 py-8">
				{loading ? (
					<Loader />
				) : data ? (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
						<div className="md:col-span-1 space-y-8">
							<Card hover={false}>
								<h2 className="text-xl font-semibold text-white mb-2">
									{data.user.name}
								</h2>
								<p className="text-gray-400">
									{data.user.login}
								</p>
								{userRoles && (
									<p className="text-gray-400">
										Role: {userRoles}
									</p>
								)}
							</Card>
							<Card hover={false}>
								<h2 className="text-xl font-semibold text-white mb-2">
									Zůstatek
								</h2>
								<p className="text-green-400 font-bold text-3xl">
									{data.balance} {campCurrency}
								</p>
								{userRoles !== "" ? (
									<div className="mt-4">
										<div className="flex space-y-4 flex-col">
											<input
												className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
												id="balanceAmount"
												name="balanceAmount"
												type="number"
												value={balanceAmount}
												onChange={(e) =>
													setBalanceAmount(
														Number(e.target.value)
													)
												}
												placeholder="Částka"
												min="0"
											/>
											<div className="flex space-x-4">
												<Button
													variant="success"
													onClick={() =>
														handleBalanceUpdate(
															"add",
															balanceAmount
														)
													}
												>
													Přidat
												</Button>
												<Button
													variant="warning"
													onClick={() =>
														handleBalanceUpdate(
															"subtract",
															balanceAmount
														)
													}
												>
													Odečíst
												</Button>
												<Button
													variant="danger"
													onClick={() =>
														handleBalanceUpdate(
															"set",
															balanceAmount
														)
													}
												>
													Nastavit
												</Button>
											</div>
										</div>
									</div>
								) : (
									<></>
								)}
							</Card>
						</div>
						<div className="md:col-span-2 space-y-8">
							<div>
								<h2 className="text-2xl font-bold mb-4">
									Transakce
								</h2>
								<TransactionsTable
									transactions={data.transactions}
									userId={data.user.id}
									onRefund={handleRefund}
								/>
							</div>
							<div>
								<h2 className="text-2xl font-bold mb-4">
									Inventář
								</h2>
								{data.inventory.length > 0 ? (
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
										{data.inventory.map((item) => (
											<Card key={item.id}>
												<h3 className="text-lg font-semibold text-white">
													{item.title}
												</h3>
												<p className="text-gray-400">
													{item.description}
												</p>
												<p className="text-green-400 font-bold mt-2">
													{item.price} {campCurrency}
												</p>
											</Card>
										))}
									</div>
								) : (
									<p>Žádné předměty v inventáři</p>
								)}
							</div>
							<div>
								<h2 className="text-2xl font-bold mb-4">
									Úspěchy
								</h2>
								{data.achievements.length > 0 ? (
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
										{data.achievements.map(
											(achievement) => (
												<Card key={achievement.id}>
													<h3 className="text-lg font-semibold text-white">
														{achievement.title}
													</h3>
													<p className="text-gray-400">
														{
															achievement.description
														}
													</p>
													<p className="text-green-400 font-bold mt-2">
														{achievement.price}{" "}
														{campCurrency}
													</p>
												</Card>
											)
										)}
									</div>
								) : (
									<p>Nezískal žádné úspěchy.</p>
								)}
							</div>
						</div>
					</div>
				) : (
					<p className="text-center col-span-2">
						Uživatel nenalezen.
					</p>
				)}
			</div>
		</>
	);
}
