"use client";

import PageTitle from "@/components/PageTitle";
import { UserItems } from "@/lib/api";
import Button from "@/components/Button";
import { FormEvent } from "react";
import Alert from "@/components/Alert";
import { useState } from "react";

interface UserItemsListProps {
	userItems: UserItems;
	setUserItems: React.Dispatch<React.SetStateAction<UserItems>>;
	existingItems: Set<string>;
	existingUsers: Set<string>;
}

export default function UserItemsList({
	userItems,
	setUserItems,
	existingItems,
	existingUsers,
}: UserItemsListProps) {
	const [message, setMessage] = useState<string | null>(null);
	const [messageType, setMessageType] = useState<"success" | "danger">(
		"success"
	);
	const users = Object.keys(userItems);

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
		setMessage(null);
		event.preventDefault();
		try {
			const response = await fetch("/api/import/user-items", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(userItems),
			});

			if (!response.ok) {
				const errorData = await response.json();
				setMessage(errorData.error || "Failed to update user items.");
				setMessageType("danger");
				return;
			}

			const result = await response.json();
			setMessage("User items updated successfully!");
			setMessageType("success");
		} catch (error) {
			console.error("Error updating user items:", error);
			setMessage("Failed to update user items.");
			setMessageType("danger");
			return;
		}
	};

	return (
		<div className="mt-6">
			<div className="flex justify-between items-center mb-4">
				<PageTitle>User Items</PageTitle>
				<div className="flex gap-2">
					<Button onClick={handleSelectAll} type="button">
						Select All
					</Button>
					<Button onClick={handleDeselectAll} type="button">
						Deselect All
					</Button>
				</div>
			</div>
			<form onSubmit={handleSubmit}>
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-700">
						<thead className="bg-gray-800">
							<tr>
								<th
									scope="col"
									className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6"
								>
									User
								</th>
								{itemHeaders.map((item) => (
									<th
										key={item}
										scope="col"
										className={`px-3 py-3.5 text-left text-sm font-semibold ${!existingItems.has(item) ? "text-red-500" : "text-white"}`}
									>
										<div className="flex flex-col items-center justify-between">
											<span>{item}</span>
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
							{users.map((user) => (
								<tr key={user}>
									<td
										className={`whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-6 ${!existingUsers.has(user) ? "text-red-500" : "text-white"} `}
									>
										{user}
									</td>
									{itemHeaders.map((item) => (
										<td
											key={item}
											className="whitespace-nowrap px-3 py-4 text-sm text-gray-300 text-center"
										>
											<input
												type="checkbox"
												checked={
													userItems[user][item] ===
													true
												}
												onChange={(e) =>
													handleCheckboxChange(
														user,
														item,
														e.target.checked
													)
												}
												className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
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
				{message && <Alert variant={messageType} message={message} />}
				<div className="mt-4 flex justify-end">
					<Button type="submit">Save Changes</Button>
				</div>
			</form>
		</div>
	);
}
