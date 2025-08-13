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
	userNames: Record<string, string | null>;
}

export default function UserItemsList({
	userItems,
	setUserItems,
	existingItems,
	existingUsers,
	userNames,
}: UserItemsListProps) {
	const [message, setMessage] = useState<string | null>(null);
	const [messageType, setMessageType] = useState<"success" | "danger">(
		"success"
	);
	const [hovered, setHovered] = useState({ row: -1, col: -1 });
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
									User
								</th>
								{itemHeaders.map((item, colIndex) => (
									<th
										key={item}
										scope="col"
										className={`px-3 py-3.5 text-left text-sm font-semibold ${!existingItems.has(item) ? "text-red-500" : "text-white"} ${hovered.col === colIndex ? "bg-gray-700" : ""}`}
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
												(hovered.row === rowIndex &&
													colIndex <= hovered.col) ||
												(hovered.col === colIndex &&
													rowIndex <= hovered.row)
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
				{message && <Alert variant={messageType} message={message} />}
				<div className="mt-4 flex justify-end">
					<Button type="submit">Save Changes</Button>
				</div>
			</form>
		</div>
	);
}
