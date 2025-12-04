"use client";

import { useEffect, useState } from "react";
import PageTitle from "@/components/PageTitle";
import { UserItems } from "@/lib/api";
import Loader from "@/components/Loader";
import Button from "@/components/Button";
import { FormEvent } from "react";
import { useToast } from "@/components/Toast";
import { useParams } from "next/navigation";
import { useBalance } from "@/hooks/useBalance";
import { fetcher, FetchError } from "@/lib/fetch";
import {
	User,
	Item,
	InventoryWithUserAndItem,
	UpdateUserItemsResponse,
} from "@/types";
import { useCurrencySymbol } from "@/hooks/useCurrencySymbol";

export default function AchievementTablePage() {
	const { camp_url } = useParams<{ camp_url: string }>();
	const [userItems, setUserItems] = useState<UserItems>({});
	const [initialUserItems, setInitialUserItems] = useState<UserItems>({});
	const [existingItems, setExistingItems] = useState<Set<string>>(new Set());
	const [existingUsers, setExistingUsers] = useState<Set<string>>(new Set());
	const [userNames, setUserNames] = useState<Record<string, string | null>>(
		{}
	);
	const [itemPrices, setItemPrices] = useState<Record<string, number>>({});
	const [isLoading, setIsLoading] = useState(true);

	const { mutate } = useBalance();

	useEffect(() => {
		async function fetchData() {
			try {
				const [usersData, itemsData, inventoryData] = await Promise.all(
					[
						fetcher<User[]>("/api/users?camp_url=" + camp_url),
						fetcher<Item[]>("/api/items"),
						fetcher<InventoryWithUserAndItem[]>("/api/inventory"),
					]
				);

				const existingUsersSet = new Set(usersData.map((u) => u.login));
				const existingItemsSet = new Set(itemsData.map((i) => i.title));

				const userItemsMap: UserItems = {};

				usersData.forEach((user) => {
					if (existingUsersSet.has(user.login)) {
						userItemsMap[user.login] = {};
						itemsData.forEach((item) => {
							if (existingItemsSet.has(item.title)) {
								userItemsMap[user.login][item.title] = false;
							}
						});
					}
				});

				inventoryData.forEach((inv) => {
					if (
						existingUsersSet.has(inv.userLogin) &&
						existingItemsSet.has(inv.itemTitle)
					) {
						userItemsMap[inv.userLogin][inv.itemTitle] =
							inv.quantity > 0;
					}
				});

				const userNamesMap: Record<string, string | null> = {};
				usersData.forEach((user) => {
					userNamesMap[user.login] = user.name;
				});

				const itemPricesMap: Record<string, number> = {};
				itemsData.forEach((item) => {
					itemPricesMap[item.title] = item.price;
				});

				setUserNames(userNamesMap);
				setItemPrices(itemPricesMap);

				setUserItems(userItemsMap);
				setInitialUserItems(JSON.parse(JSON.stringify(userItemsMap)));
				setExistingUsers(existingUsersSet);
				setExistingItems(existingItemsSet);
			} catch (error) {
				console.error("Nepodařilo se načíst data o úspěších:", error);
			} finally {
				setIsLoading(false);
			}
		}

		fetchData();
	}, [camp_url]);

	if (isLoading) {
		return <Loader />;
	}

	return (
		<div className="achievement-table">
			<PageTitle>Tabulka úspěchů</PageTitle>
			<UserItemsList
				userItems={userItems}
				initialUserItems={initialUserItems}
				setUserItems={setUserItems}
				existingItems={existingItems}
				existingUsers={existingUsers}
				userNames={userNames}
				itemPrices={itemPrices}
				mutate={mutate}
			/>
		</div>
	);
}

interface UserItemsListProps {
	userItems: UserItems;
	initialUserItems: UserItems;
	setUserItems: React.Dispatch<React.SetStateAction<UserItems>>;
	existingItems: Set<string>;
	existingUsers: Set<string>;
	userNames: Record<string, string | null>;
	itemPrices: Record<string, number>;
	mutate: () => void;
}

function UserItemsList({
	userItems,
	initialUserItems,
	setUserItems,
	existingItems,
	existingUsers,
	userNames,
	itemPrices,
	mutate,
}: UserItemsListProps) {
	const { showError, showSuccess } = useToast();
	const [hovered, setHovered] = useState({ row: -1, col: -1 });
	const users = Object.keys(userItems);
	const campCurrency = useCurrencySymbol();
	if (users.length === 0) {
		return null;
	}

	const allItems = new Set<string>();
	users.forEach((user) => {
		Object.keys(userItems[user]).forEach((item) => {
			allItems.add(item);
		});
	});
	const itemHeaders = Array.from(allItems);

	const handleSelectAll = () => {
		setUserItems((prevUserItems) => {
			const newUserItems = JSON.parse(JSON.stringify(prevUserItems));
			for (const user of users) {
				if (existingUsers.has(user)) {
					for (const item of itemHeaders) {
						if (existingItems.has(item)) {
							newUserItems[user][item] = true;
						}
					}
				}
			}
			return newUserItems;
		});
	};

	const handleDeselectAll = () => {
		setUserItems((prevUserItems) => {
			const newUserItems = JSON.parse(JSON.stringify(prevUserItems));
			for (const user of users) {
				if (existingUsers.has(user)) {
					for (const item of itemHeaders) {
						if (existingItems.has(item)) {
							newUserItems[user][item] = false;
						}
					}
				}
			}
			return newUserItems;
		});
	};

	const handleSelectAllColumn = (itemToSelect: string) => {
		setUserItems((prevUserItems) => {
			const newUserItems = JSON.parse(JSON.stringify(prevUserItems));
			for (const user of users) {
				if (existingUsers.has(user)) {
					newUserItems[user][itemToSelect] = true;
				}
			}
			return newUserItems;
		});
	};

	const handleDeselectAllColumn = (itemToDeselect: string) => {
		setUserItems((prevUserItems) => {
			const newUserItems = JSON.parse(JSON.stringify(prevUserItems));
			for (const user of users) {
				if (existingUsers.has(user)) {
					newUserItems[user][itemToDeselect] = false;
				}
			}
			return newUserItems;
		});
	};

	const handleSelectAllRow = (userToSelect: string) => {
		setUserItems((prevUserItems) => {
			const newUserItems = JSON.parse(JSON.stringify(prevUserItems));
			for (const item of existingItems) {
				if (newUserItems[userToSelect].hasOwnProperty(item)) {
					newUserItems[userToSelect][item] = true;
				}
			}
			return newUserItems;
		});
	};

	const handleDeselectAllRow = (userToDeselect: string) => {
		setUserItems((prevUserItems) => {
			const newUserItems = JSON.parse(JSON.stringify(prevUserItems));
			for (const item of existingItems) {
				if (newUserItems[userToDeselect].hasOwnProperty(item)) {
					newUserItems[userToDeselect][item] = false;
				}
			}
			return newUserItems;
		});
	};

	const handleRevert = () => {
		setUserItems(initialUserItems);
	};

	const handleCheckboxChange = (
		user: string,
		item: string,
		checked: boolean
	) => {
		setUserItems((prevUserItems) => {
			const newUserItems = { ...prevUserItems };
			newUserItems[user] = { ...newUserItems[user], [item]: checked };
			return newUserItems;
		});
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		try {
			await fetcher<UpdateUserItemsResponse>("/api/table", {
				method: "POST",
				body: userItems,
			});

			showSuccess("Předměty uživatelů byly úspěšně aktualizovány!");
			mutate();
		} catch (error) {
			if (error instanceof FetchError) {
				showError(
					error.info.error ||
						"Nepodařilo se aktualizovat předměty uživatelů."
				);
			} else {
				showError(
					"Při aktualizaci předmětů uživatelů došlo k neznámé chybě."
				);
			}
			console.error("Error updating user items:", error);
		}
	};

	return (
		<div className="mt-6">
			<div className="flex justify-between items-center mb-4">
				<PageTitle>Předměty uživatelů</PageTitle>
				<div className="flex gap-2">
					<Button onClick={handleSelectAll} type="button">
						Vybrat vše
					</Button>
					<Button onClick={handleDeselectAll} type="button">
						Odznačit vše
					</Button>
					<Button onClick={handleRevert} type="button">
						Vrátit zpět
					</Button>
				</div>
			</div>
			<form onSubmit={handleSubmit}>
				<div className="overflow-x-auto overflow-y-auto max-h-screen max-w-full w-screen">
					<table
						className="min-w-full divide-y divide-gray-700"
						onMouseLeave={() => setHovered({ row: -1, col: -1 })}
					>
						<thead className="bg-gray-800 sticky top-0 z-10">
							<tr className="divide-x divide-gray-700">
								<th
									scope="col"
									className={`sticky z-11 left-0 bg-gray-800 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6 ${hovered.row !== -1 ? "bg-gray-800" : ""}`}
								>
									Uživatel
								</th>
								{itemHeaders.map((item, colIndex) => (
									<th
										key={item}
										scope="col"
										className={`px-3 py-3.5 text-left text-sm font-semibold ${!existingItems.has(item) ? "text-red-500" : "text-white"} ${hovered.col === colIndex ? "bg-gray-700" : ""}`}
									>
										<div className="flex flex-col items-center justify-between">
											<span>
												{item} ({itemPrices[item]}{" "}
												{campCurrency})
											</span>
											{existingItems.has(item) && (
												<div className="flex gap-1">
													<button
														type="button"
														onClick={() =>
															handleSelectAllColumn(
																item
															)
														}
														className="text-xs p-1 rounded-full hover:bg-gray-700"
													>
														✓
													</button>
													<button
														type="button"
														onClick={() =>
															handleDeselectAllColumn(
																item
															)
														}
														className="text-xs p-1 rounded-full hover:bg-gray-700"
													>
														✗
													</button>
												</div>
											)}
										</div>
									</th>
								))}
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-800 bg-gray-900">
							{users.map((user, rowIndex) => (
								<tr
									key={user}
									className="divide-x divide-gray-800"
								>
									<td
										className={`sticky left-0 z-10 whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-6 ${!existingUsers.has(user) ? "text-red-500" : "text-white"} ${hovered.row === rowIndex ? "bg-gray-800" : "bg-gray-900"}`}
									>
										<div className="flex items-center justify-between">
											<span>
												{userNames[user]
													? `${userNames[user]} (${user})`
													: user}
											</span>
											{existingUsers.has(user) && (
												<div className="flex gap-1">
													<button
														type="button"
														onClick={() =>
															handleSelectAllRow(
																user
															)
														}
														className="text-xs p-1 rounded-full hover:bg-gray-700"
													>
														✓
													</button>
													<button
														type="button"
														onClick={() =>
															handleDeselectAllRow(
																user
															)
														}
														className="text-xs p-1 rounded-full hover:bg-gray-700"
													>
														✗
													</button>
												</div>
											)}
										</div>
									</td>
									{itemHeaders.map((item, colIndex) => (
										<td
											key={item}
											className={`whitespace-nowrap px-3 py-4 text-sm text-gray-300 text-center ${
												!existingItems.has(item) ||
												!existingUsers.has(user)
													? "cursor-not-allowed bg-gray-800"
													: `cursor-pointer ${
															userItems[user][
																item
															]
																? "bg-green-800"
																: "bg-red-800"
														}`
											} ${
												hovered.row === rowIndex &&
												hovered.col === colIndex
													? "brightness-125"
													: ""
											}`}
											onMouseEnter={() =>
												setHovered({
													row: rowIndex,
													col: colIndex,
												})
											}
											onClick={() => {
												if (
													!existingItems.has(item) ||
													!existingUsers.has(user)
												)
													return;
												handleCheckboxChange(
													user,
													item,
													!userItems[user][item]
												);
											}}
										>
											<input
												type="checkbox"
												readOnly
												checked={
													userItems[user][item] ===
													true
												}
												className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 pointer-events-none"
												disabled={
													!existingItems.has(item) ||
													!existingUsers.has(user)
												}
											/>
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<div className="mt-4 flex justify-end">
					<Button type="submit">Uložit změny</Button>
				</div>
			</form>
		</div>
	);
}
