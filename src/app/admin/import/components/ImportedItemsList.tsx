"use client";

import Button from "@/components/Button";
import FormGroup from "@/components/form/FormGroup";
import PageTitle from "@/components/PageTitle";
import { ItemFormData } from "../types";

interface ImportedItemsListProps {
	items: ItemFormData[];
	setItems: React.Dispatch<React.SetStateAction<ItemFormData[]>>;
}

export default function ImportedItemsList({
	items,
	setItems,
}: ImportedItemsListProps) {
	const handleItemChange = (
		index: number,
		field: "description" | "price",
		value: string
	) => {
		const newItems = [...items];
		if (field === "price") {
			newItems[index][field] = Number(value);
		} else {
			newItems[index][field] = value;
		}
		setItems(newItems);
	};

	const handleSingleItemSubmit = async (
		item: ItemFormData,
		index: number
	) => {
		if (item.existing) return;

		setItems((currentItems) => {
			const newItems = [...currentItems];
			newItems[index] = { ...newItems[index], status: "submitting" };
			return newItems;
		});

		try {
			const response = await fetch("/api/items", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: item.title,
					description: item.description,
					price: item.price,
				}),
			});

			const result = await response.json();

			setItems((currentItems) => {
				const newItems = [...currentItems];
				if (!response.ok) {
					newItems[index] = {
						...newItems[index],
						status: "error",
						message: result.error || "Failed to create item.",
					};
				} else {
					newItems[index] = {
						...newItems[index],
						status: "success",
						message: "Item created successfully!",
					};
				}
				return newItems;
			});
		} catch (error) {
			setItems((currentItems) => {
				const newItems = [...currentItems];
				newItems[index] = {
					...newItems[index],
					status: "error",
					message: "An error occurred.",
				};
				return newItems;
			});
		}
	};

	const handleAllItemsSubmit = async () => {
		const itemsToSubmit = items
			.map((item, index) => ({ ...item, originalIndex: index }))
			.filter(
				(item) =>
					(!item.status ||
						item.status === "pending" ||
						item.status === "error") &&
					!item.existing
			);

		if (itemsToSubmit.length === 0) {
			return;
		}

		setItems((currentItems) => {
			const newItems = [...currentItems];
			itemsToSubmit.forEach(({ originalIndex }) => {
				newItems[originalIndex].status = "submitting";
			});
			return newItems;
		});

		const promises = itemsToSubmit.map((item) =>
			fetch("/api/items", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: item.title,
					description: item.description,
					price: item.price,
				}),
			})
				.then(async (response) => {
					const result = await response.json();
					return {
						originalIndex: item.originalIndex,
						success: response.ok,
						message: response.ok
							? "Item created successfully!"
							: result.error || "Failed to create item",
					};
				})
				.catch(() => {
					return {
						originalIndex: item.originalIndex,
						success: false,
						message: "An error occurred.",
					};
				})
		);

		const results = await Promise.all(promises);

		setItems((currentItems) => {
			const newItems = [...currentItems];
			results.forEach((result) => {
				newItems[result.originalIndex].status = result.success
					? "success"
					: "error";
				newItems[result.originalIndex].message = result.message;
			});
			return newItems;
		});
	};

	const itemsToSubmitCount = items.filter(
		(item) =>
			(!item.status ||
				item.status === "pending" ||
				item.status === "error") &&
			!item.existing
	).length;

	if (
		items.length > 0 &&
		items.filter((item) => !item.existing).length === 0
	) {
		return (
			<div className="mt-6">
				<PageTitle>Imported Items</PageTitle>
				<p>All items already exist.</p>
			</div>
		);
	}

	return (
		<div className="mt-6">
			<PageTitle>Imported Items</PageTitle>
			{items.length > 0 ? (
				<div className="flex flex-col items-center">
					{items.map((item, index) => (
						<div
							key={index}
							className={`mb-4 p-4 max-w-1/2 w-full gap-5 items-center border rounded-lg grid grid-cols-5 shadow-sm bg-gray-800 border-gray-700 ${item.status === "success" ? "border-green-500" : ""} ${item.existing ? "border-red-500" : ""}`}
						>
							<h4 className="font-bold text-lg mb-2">
								{item.title}
							</h4>
							<div className="space-y-4 flex items-center gap-5 col-span-3">
								<FormGroup>
									<label
										htmlFor={`description-${index}`}
										className="block text-sm font-medium text-gray-700 dark:text-gray-300"
									>
										Description
									</label>
									<textarea
										id={`description-${index}`}
										value={item.description}
										onChange={(e) =>
											handleItemChange(
												index,
												"description",
												e.target.value
											)
										}
										className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
										disabled={
											item.status === "submitting" ||
											item.status === "success" ||
											item.existing
										}
										rows={3}
									/>
								</FormGroup>
								<FormGroup>
									<label
										htmlFor={`price-${index}`}
										className="block text-sm font-medium text-gray-700 dark:text-gray-300"
									>
										Price
									</label>
									<input
										type="number"
										id={`price-${index}`}
										value={item.price}
										onChange={(e) =>
											handleItemChange(
												index,
												"price",
												e.target.value
											)
										}
										className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
										disabled={
											item.status === "submitting" ||
											item.status === "success" ||
											item.existing
										}
									/>
								</FormGroup>
							</div>
							<div className="mt-4">
								<Button
									onClick={() =>
										handleSingleItemSubmit(item, index)
									}
									disabled={
										item.status === "submitting" ||
										item.status === "success" ||
										item.existing
									}
								>
									{item.existing
										? "Item Exists"
										: item.status === "submitting"
											? "Creating..."
											: item.status === "success"
												? "Created"
												: "Create Item"}
								</Button>
							</div>
							{item.status === "error" && (
								<p className="text-red-500 mt-2 text-sm">
									{item.message}
								</p>
							)}
							{item.status === "success" && !item.existing && (
								<p className="text-green-500 mt-2 text-sm">
									{item.message}
								</p>
							)}
						</div>
					))}
					<div className="mt-6">
						<Button
							onClick={handleAllItemsSubmit}
							disabled={itemsToSubmitCount === 0}
						>
							Create All ({itemsToSubmitCount}) Pending Items
						</Button>
					</div>
				</div>
			) : (
				<p>No items imported.</p>
			)}
		</div>
	);
}
