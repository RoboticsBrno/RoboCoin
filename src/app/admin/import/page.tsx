"use client";

import FormGroup from "@/components/form/FormGroup";
import FormInput from "@/components/form/FormInput";
import FormSubmit from "@/components/form/FormSubmit";
import FormTitle from "@/components/form/FormTitle";
import PageTitle from "@/components/PageTitle";
import { FormProvider } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FormContainer from "@/components/form/FormContainer";
import Alert from "@/components/Alert";
import Loader from "@/components/Loader";
import Button from "@/components/Button";
import FormCheckbox from "@/components/form/FormCheckbox";
import { UserItems } from "@/lib/api";

const importSchema = z.object({
	sheetKey: z.string().min(1, { message: "Sheet key is required" }),
	sheetName: z.string().min(1, { message: "Sheet name is required" }),
	importUserItems: z.boolean(),
	importItems: z.boolean(),
});

type ImportSchema = z.infer<typeof importSchema>;

interface ItemFormData {
	title: string;
	description: string;
	price: number;
	status?: "pending" | "submitting" | "success" | "error";
	message?: string;
	existing?: boolean;
}

export default function ImportPage() {
	const [message, setMessage] = useState<string | null>(null);
	const [messageType, setMessageType] = useState<"success" | "danger">("success");
	const [isLoading, setIsLoading] = useState(false);
	const [loaded, setLoaded] = useState(false);
	const [userItems, setUserItems] = useState<UserItems[]>([]);
	const [items, setItems] = useState<ItemFormData[]>([]);

	const methods = useForm<ImportSchema>({
		resolver: zodResolver(importSchema),
		defaultValues: {
			sheetKey: "",
			sheetName: "",
			importUserItems: true,
			importItems: true,
		},
	});

	const {
		handleSubmit,
		formState: { isSubmitting },
	} = methods;

	const onFormSubmit = async (data: ImportSchema) => {
		try {
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
				setUserItems([]);
				setItems([]);
				setLoaded(false);
			} else {
				setMessage("Data imported successfully!");
				setMessageType("success");
				setUserItems(result.userItems || []);

				const itemsResponse = await fetch('/api/items');
				const existingItems: { title: string }[] = await itemsResponse.json();
				const existingItemTitles = new Set(existingItems.map(item => item.title));

				const itemsFromSheet = (result.items || []).map((itemTitle: string) => {
					const existing = existingItemTitles.has(itemTitle);
					return {
						title: itemTitle,
						description: "",
						price: 0,
						status: "pending" as const,
						existing,
					};
				});

				setItems(itemsFromSheet);
				setLoaded(true);
			}
			setIsLoading(false);
		} catch (error) {
			console.error("Import error:", error);
			setMessage("An error occurred while importing data.");
			setMessageType("danger");
			setUserItems([]);
			setItems([]);
			setLoaded(false);
			setIsLoading(false);
		}
	};

	const handleItemChange = (index: number, field: "description" | "price", value: string) => {
		const newItems = [...items];
		if (field === "price") {
			newItems[index][field] = Number(value);
		} else {
			newItems[index][field] = value;
		}
		setItems(newItems);
	};

	const handleSingleItemSubmit = async (item: ItemFormData, index: number) => {
		if (item.existing) return;

		setItems(currentItems => {
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

			setItems(currentItems => {
				const newItems = [...currentItems];
				if (!response.ok) {
					newItems[index] = { ...newItems[index], status: "error", message: result.error || "Failed to create item." };
				} else {
					newItems[index] = { ...newItems[index], status: "success", message: "Item created successfully!" };
				}
				return newItems;
			});
		} catch (error) {
			setItems(currentItems => {
				const newItems = [...currentItems];
				newItems[index] = { ...newItems[index], status: "error", message: "An error occurred." };
				return newItems;
			});
		}
	};

	const handleAllItemsSubmit = async () => {
		const itemsToSubmit = items
			.map((item, index) => ({ ...item, originalIndex: index }))
			.filter(item => (!item.status || item.status === "pending" || item.status === "error") && !item.existing);

		if (itemsToSubmit.length === 0) {
			return;
		}

		setItems(currentItems => {
			const newItems = [...currentItems];
			itemsToSubmit.forEach(({ originalIndex }) => {
				newItems[originalIndex].status = "submitting";
			});
			return newItems;
		});

		const promises = itemsToSubmit.map(item =>
			fetch("/api/items", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: item.title,
					description: item.description,
					price: item.price,
				}),
			}).then(async response => {
				const result = await response.json();
				return {
					originalIndex: item.originalIndex,
					success: response.ok,
					message: response.ok ? "Item created successfully!" : result.error || "Failed to create item",
				};
			}).catch(() => {
				return {
					originalIndex: item.originalIndex,
					success: false,
					message: "An error occurred.",
				};
			})
		);

		const results = await Promise.all(promises);

		setItems(currentItems => {
			const newItems = [...currentItems];
			results.forEach(result => {
				newItems[result.originalIndex].status = result.success ? "success" : "error";
				newItems[result.originalIndex].message = result.message;
			});
			return newItems;
		});
	};

	const itemsToSubmitCount = items.filter(item => (!item.status || item.status === "pending" || item.status === "error") && !item.existing).length;

	return (
		<>
			<PageTitle>Import from Google Sheets</PageTitle>
			{message && (
				<Alert variant={messageType} message={message} />
			)}
			<FormProvider {...methods}>
				<FormContainer onSubmit={handleSubmit(onFormSubmit)}>
					<FormTitle>Import data</FormTitle>
					<FormGroup>
						<FormInput
							name="sheetKey"
							label="Google Sheets Key"
							required
						/>
					</FormGroup>
					<FormGroup>
						<FormInput
							name="sheetName"
							label="Sheet Name"
							required
						/>
					</FormGroup>
					<FormGroup>
						<FormCheckbox
							name="importUserItems"
							label="Import User Items"
							defaultChecked={true}
						/>
					</FormGroup>
					<FormGroup>
						<FormCheckbox
							name="importItems"
							label="Import Items"
							defaultChecked={true}
						/>
					</FormGroup>
					<FormSubmit isLoading={isSubmitting}>Try Import</FormSubmit>
				</FormContainer>
			</FormProvider>
			{isLoading ? <Loader /> : (
				loaded && userItems.length > 0 && (
					<div>
						<PageTitle>User Items</PageTitle>
					</div>
				) ||
				loaded && items.length > 0 && (
					<div className="mt-6">
						<PageTitle>Imported Items</PageTitle>
						{items.length > 0 ? (
							<div className="flex flex-col items-center">
								{items.map((item, index) => (
									<div key={index} className={`mb-4 p-4 max-w-1/2 w-full gap-5 items-center border rounded-lg grid grid-cols-5 shadow-sm bg-gray-800 border-gray-700 ${item.status === "success" ? 'border-green-500' : ''} ${item.existing ? 'border-red-500' : ''}`}>
										<h4 className="font-bold text-lg mb-2">{item.title}</h4>
										<div className="space-y-4 flex items-center gap-5 col-span-3">
											<FormGroup>
												<label htmlFor={`description-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
												<textarea
													id={`description-${index}`}
													value={item.description}
													onChange={(e) => handleItemChange(index, "description", e.target.value)}
													className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
													disabled={item.status === "submitting" || item.status === "success" || item.existing}
													rows={3}
												/>
											</FormGroup>
											<FormGroup>
												<label htmlFor={`price-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
												<input
													type="number"
													id={`price-${index}`}
													value={item.price}
													onChange={(e) => handleItemChange(index, "price", e.target.value)}
													className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
													disabled={item.status === "submitting" || item.status === "success" || item.existing}
												/>
											</FormGroup>
										</div>
										<div className="mt-4">
											<Button
												onClick={() => handleSingleItemSubmit(item, index)}
												disabled={item.status === "submitting" || item.status === "success" || item.existing}
											>
												{item.existing ? "Item Exists" : item.status === "submitting" ? "Creating..." : item.status === "success" ? "Created" : "Create Item"}
											</Button>
										</div>
										{item.status === "error" && <p className="text-red-500 mt-2 text-sm">{item.message}</p>}
										{item.status === "success" && !item.existing && <p className="text-green-500 mt-2 text-sm">{item.message}</p>}
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
				)
			)}
		</>
	);
}
