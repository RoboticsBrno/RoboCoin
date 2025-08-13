"use client";

import { useEffect, useState } from "react";
import PageTitle from "@/components/PageTitle";
import UserItemsList from "@/app/admin/import/components/UserItemsList";
import { UserItems } from "@/lib/api";
import Loader from "@/components/Loader";

export default function AchievementTablePage() {
	const [userItems, setUserItems] = useState<UserItems>({});
	const [existingItems, setExistingItems] = useState<Set<string>>(new Set());
	const [existingUsers, setExistingUsers] = useState<Set<string>>(new Set());
	const [userNames, setUserNames] = useState<Record<string, string | null>>(
		{}
	);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function fetchData() {
			try {
				const [usersRes, itemsRes, inventoryRes] = await Promise.all([
					fetch("/api/users"),
					fetch("/api/items"),
					fetch("/api/inventory"),
				]);

				if (!usersRes.ok || !itemsRes.ok || !inventoryRes.ok) {
					throw new Error("Failed to fetch data");
				}

				const usersData: { login: string; name: string }[] =
					await usersRes.json();
				const itemsData: { title: string }[] = await itemsRes.json();
				const inventoryData: {
					userLogin: string;
					itemTitle: string;
					quantity: number;
				}[] = await inventoryRes.json();

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
					userNamesMap[user.login] = user.name; // Assuming login is the name, adjust as needed
				});

				setUserNames(userNamesMap);

				setUserItems(userItemsMap);
				setExistingUsers(existingUsersSet);
				setExistingItems(existingItemsSet);
			} catch (error) {
				console.error("Failed to fetch achievement data:", error);
			} finally {
				setIsLoading(false);
			}
		}

		fetchData();
	}, []);

	if (isLoading) {
		return <Loader />;
	}

	return (
		<div className="achievement-table">
			<PageTitle>Achievement Table</PageTitle>
			<UserItemsList
				userItems={userItems}
				setUserItems={setUserItems}
				existingItems={existingItems}
				existingUsers={existingUsers}
				userNames={userNames}
			/>
		</div>
	);
}
