"use client";

import PageTitle from "@/components/PageTitle";
import { useState } from "react";
import Alert from "@/components/Alert";
import Loader from "@/components/Loader";
import { UserItems } from "@/lib/api";
import ImportForm from "./components/ImportForm";
import type { ImportSchema } from "./components/ImportForm";
import ImportedItemsList from "./components/ImportedItemsList";
import UserItemsList from "./components/UserItemsList";
import { ItemFormData } from "./types";

export default function ImportPage() {
	const [message, setMessage] = useState<string | null>(null);
	const [messageType, setMessageType] = useState<"success" | "danger">(
		"success"
	);
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [loaded, setLoaded] = useState(false);
	const [userItems, setUserItems] = useState<UserItems>({});
	const [items, setItems] = useState<ItemFormData[]>([]);
	const [existingItems, setExistingItems] = useState<Set<string>>(new Set());
	const [existingUsers, setExistingUsers] = useState<Set<string>>(new Set());

	const onFormSubmit = async (data: ImportSchema) => {
		try {
			setIsSubmitting(true);
			setIsLoading(true);
			const response = await fetch("/api/import/google-sheets", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error("Failed to import data");
			}

			const result = await response.json();
			if (result.error) {
				setMessage(result.error);
				setMessageType("danger");
				setUserItems({});
				setItems([]);
				setLoaded(false);
			} else {
				setMessage("Data imported successfully!");
				setMessageType("success");

				const itemsResponse = await fetch("/api/items");
				const existingItems: { title: string }[] =
					await itemsResponse.json();
				const existingItemTitles = new Set(
					existingItems.map((item) => item.title)
				);
				setExistingItems(existingItemTitles);

				const itemsFromSheet = (result.items || []).map(
					(itemTitle: string) => {
						const existing = existingItemTitles.has(itemTitle);
						return {
							title: itemTitle,
							description: "",
							price: 0,
							status: "pending" as const,
							existing,
						};
					}
				);

				const usersResponse = await fetch("/api/users");
				const existingUsersData: { login: string }[] =
					await usersResponse.json();
				const existingUsers = new Set(
					existingUsersData.map(
						(user: { login: string }) => user.login
					)
				);
				setExistingUsers(existingUsers);

				setItems(itemsFromSheet);
				setUserItems(result.userItems || {});

				setLoaded(true);
			}
			setIsLoading(false);
			setIsSubmitting(false);
		} catch (error) {
			console.error("Import error:", error);
			setMessage("An error occurred while importing data.");
			setMessageType("danger");
			setUserItems({});
			setItems([]);
			setLoaded(false);
			setIsLoading(false);
			setIsSubmitting(false);
		}
	};

	return (
		<>
			<PageTitle>Import from Google Sheets</PageTitle>
			{message && <Alert variant={messageType} message={message} />}
			<ImportForm
				onFormSubmit={onFormSubmit}
				isSubmitting={isSubmitting}
			/>
			{isLoading ? (
				<Loader />
			) : (
				loaded && (
					<>
						{userItems && Object.keys(userItems).length > 0 && (
							<UserItemsList
								userItems={userItems}
								setUserItems={setUserItems}
								existingItems={existingItems}
								existingUsers={existingUsers}
							/>
						)}
						{items.length > 0 && (
							<ImportedItemsList
								items={items}
								setItems={setItems}
							/>
						)}
					</>
				)
			)}
		</>
	);
}
