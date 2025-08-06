"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormContainer from "@/components/form/FormContainer";
import FormTitle from "@/components/form/FormTitle";
import FormSubtitle from "@/components/form/FormSubtitle";
import FormGroup from "@/components/form/FormGroup";
import FormSubmit from "@/components/form/FormSubmit";
import FormSelect from "@/components/form/FormSelect";
import FormCheckbox from "@/components/form/FormCheckbox";
import Alert from "@/components/Alert";
import { useBalance } from "@/hooks/useBalance";

// Define types for the data we'll fetch
interface User {
	id: number;
	name: string;
	login: string;
}

interface Item {
	id: number;
	title: string;
	price: number;
}

// Zod schema for the form validation
const syncSchema = z.object({
	userId: z.string().min(1, { message: "Please select a user" }),
	itemIds: z.array(z.coerce.number()),
});

type SyncSchema = z.infer<typeof syncSchema>;

export default function ManageUserAchievementsPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [items, setItems] = useState<Item[]>([]);
	const [selectedUserId, setSelectedUserId] = useState<string>("");
	const [isLoading, setIsLoading] = useState(true);
	const [isInventoryLoading, setIsInventoryLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [messageType, setMessageType] = useState<"success" | "danger">(
		"success"
	);
	const { refreshBalance } = useBalance();

	const methods = useForm<SyncSchema>({
		resolver: zodResolver(syncSchema),
		defaultValues: { userId: "", itemIds: [] },
	});
	const {
		handleSubmit,
		setValue,
		watch,
		formState: { isSubmitting },
	} = methods;

	// Watch the itemIds field to get its current value for rendering
	const currentItemIds = watch("itemIds");

	// Fetch users and items on initial load
	useEffect(() => {
		const fetchData = async () => {
			try {
				const [usersRes, itemsRes] = await Promise.all([
					fetch("/api/users"),
					fetch("/api/items"),
				]);
				setUsers(await usersRes.json());
				setItems(await itemsRes.json());
			} catch (error) {
				console.error("Failed to fetch data:", error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchData();
	}, []);

	// Fetch the selected user's inventory and update the form state
	useEffect(() => {
		if (!selectedUserId) {
			setValue("itemIds", []);
			return;
		}

		const fetchUserInventory = async () => {
			setIsInventoryLoading(true);
			try {
				const response = await fetch(
					`/api/inventory/user/${selectedUserId}`
				);
				const ownedItemIds: number[] = await response.json();
				setValue("itemIds", ownedItemIds);
			} catch (error) {
				console.error("Failed to fetch user inventory:", error);
			} finally {
				setIsInventoryLoading(false);
			}
		};

		fetchUserInventory();
	}, [selectedUserId, setValue]);

	const onFormSubmit = async (data: SyncSchema) => {
		try {
			const response = await fetch("/api/inventory/to-user", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				console.error("Failed to sync achievements");
				const errorData = await response.json();
				setMessage(errorData.error || "Failed to sync achievements");
				setMessageType("danger");
			} else {
				setMessage("Achievements updated successfully!");
				setMessageType("success");
				setValue("userId", "");
				setSelectedUserId("");
				await refreshBalance(); // Refresh the balance after updating achievements
			}
		} catch (error) {
			console.error("An unexpected error occurred:", error);
			setMessage(
				"An unexpected error occurred while updating achievements."
			);
			setMessageType("danger");
		}
	};

	if (isLoading) {
		return (
			<p className="text-center text-gray-400">Loading form data...</p>
		);
	}

	return (
		<div>
			{message && <Alert variant={messageType} message={message} />}
			<FormProvider {...methods}>
				<FormContainer onSubmit={handleSubmit(onFormSubmit)}>
					<FormTitle>Manage User Achievements</FormTitle>
					<FormSubtitle>
						Check or uncheck achievements to grant or revoke them.
					</FormSubtitle>

					<FormGroup>
						<FormSelect
							label="User"
							name="userId"
							options={users.map((user) => ({
								value: user.id,
								label: `${user.name} (${user.login})`,
							}))}
							onChange={(e) => setSelectedUserId(e.target.value)}
						/>
					</FormGroup>

					<FormGroup>
						<label className="block text-sm font-medium text-gray-300">
							Achievements
							{isInventoryLoading ? " (loading)" : null}
						</label>
						{!selectedUserId ? (
							<p className="text-gray-500 text-sm mt-1">
								Please select a user to view their achievements.
							</p>
						) : (
							<ItemOptions
								items={items}
								currentItemIds={currentItemIds}
								setValue={setValue}
							/>
						)}
					</FormGroup>

					<FormSubmit isLoading={isSubmitting}>
						Update Achievements
					</FormSubmit>
				</FormContainer>
			</FormProvider>
		</div>
	);
}

function ItemOptions({
	items,
	currentItemIds,
	setValue,
}: {
	items: Item[];
	currentItemIds: number[] | undefined;
	setValue: UseFormSetValue<{ userId: string; itemIds: number[] }>;
}) {
	return (
		<div className="mt-2 grid grid-cols-2 gap-4">
			{items.map((item) => (
				<FormCheckbox
					key={item.id}
					id={`item-${item.id}`}
					label={`${item.title} (${item.price})`}
					name="itemIds"
					value={item.id}
					checked={currentItemIds?.includes(item.id)}
					onChange={(e) => {
						const checked = e.target.checked;
						const currentIds = currentItemIds || [];
						if (checked) {
							setValue("itemIds", [...currentIds, item.id]);
						} else {
							setValue(
								"itemIds",
								currentIds.filter((id) => id !== item.id)
							);
						}
					}}
				/>
			))}
		</div>
	);
}
