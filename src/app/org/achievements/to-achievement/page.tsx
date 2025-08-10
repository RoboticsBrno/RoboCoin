"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm, FormProvider, UseFormSetValue } from "react-hook-form";
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
import Loader from "@/components/Loader";

// Define types for the data we'll fetch
interface User {
	id: number;
	name: string;
}

interface Item {
	id: number;
	title: string;
}

// Zod schema for the form validation
const syncSchema = z.object({
	itemId: z.string().min(1, { message: "Please select an achievement" }),
	userIds: z.array(z.string()).refine(
		(arr) => {
			return arr.every((id) => !isNaN(Number(id)) && Number(id) > 0);
		},
		{ message: "All user IDs must be valid numbers" }
	),
});

type SyncSchema = z.infer<typeof syncSchema>;

export default function ManageAchievementUsersPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [items, setItems] = useState<Item[]>([]);
	const [selectedItemId, setSelectedItemId] = useState<string>("");
	const [isLoading, setIsLoading] = useState(true);
	const [isOwnersLoading, setIsOwnersLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [messageType, setMessageType] = useState<"success" | "danger">(
		"success"
	);

	const methods = useForm<SyncSchema>({
		resolver: zodResolver(syncSchema),
		defaultValues: { itemId: "", userIds: [] },
	});
	const {
		handleSubmit,
		setValue,
		watch,
		formState: { isSubmitting },
	} = methods;
	const { refreshBalance } = useBalance();

	const currentUserIds = watch("userIds");

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

	// Fetch the selected item's owners and update the form state
	useEffect(() => {
		if (!selectedItemId) {
			setValue("userIds", []);
			return;
		}

		const fetchItemOwners = async () => {
			setIsOwnersLoading(true);
			try {
				const response = await fetch(
					`/api/inventory/item/${selectedItemId}`
				);
				const ownerIds: number[] = await response.json();
				setValue(
					"userIds",
					ownerIds.map((id) => id.toString())
				); // Convert to strings for the form
			} catch (error) {
				console.error("Failed to fetch item owners:", error);
			} finally {
				setIsOwnersLoading(false);
			}
		};

		fetchItemOwners();
	}, [selectedItemId, setValue]);

	const onFormSubmit = async (data: SyncSchema) => {
		try {
			const submitData = {
				itemId: data.itemId,
				userIds: data.userIds.map((id) => Number(id)), // Convert to numbers here
			};
			const response = await fetch("/api/inventory/to-achievement", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(submitData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				setMessage(
					errorData.error || "Failed to sync achievement owners"
				);
				setMessageType("danger");
			} else {
				setMessage("Achievement owners updated successfully!");
				setMessageType("success");
				setValue("itemId", ""); // Reset item selection
				setSelectedItemId("");
				await refreshBalance(); // Refresh balance after update
			}
		} catch (error) {
			setMessage("An unexpected error occurred while updating owners.");
			setMessageType("danger");
		}
	};

	if (isLoading) {
		return <Loader />;
	}

	return (
		<div>
			{message && (
				<Alert
					variant={messageType}
					message={message}
					onClose={() => setMessage(null)}
				/>
			)}
			<FormProvider {...methods}>
				<FormContainer onSubmit={handleSubmit(onFormSubmit)}>
					<FormTitle>Manage Achievement Owners</FormTitle>
					<FormSubtitle>
						Select an achievement to manage which users own it.
					</FormSubtitle>

					<FormGroup>
						<FormSelect
							label="Achievement"
							name="itemId"
							options={items.map((item) => ({
								value: item.id,
								label: item.title,
							}))}
							onChange={(e) => setSelectedItemId(e.target.value)}
						/>
					</FormGroup>

					<FormGroup>
						<label className="block text-sm font-medium text-gray-300">
							Users {isOwnersLoading ? "(loading)" : ""}
						</label>
						{!selectedItemId ? (
							<p className="text-gray-500 text-sm mt-1">
								Please select an achievement to see its owners.
							</p>
						) : (
							<UserOptions
								items={users}
								currentUserIds={currentUserIds} // Keep as string[]
								setValue={setValue}
							/>
						)}
					</FormGroup>

					<FormSubmit isLoading={isSubmitting}>
						Update Owners
					</FormSubmit>
				</FormContainer>
			</FormProvider>
		</div>
	);
}

function UserOptions({
	items,
	currentUserIds,
	setValue,
}: {
	items: User[];
	currentUserIds: string[] | undefined;
	setValue: UseFormSetValue<{ itemId: string; userIds: string[] }>;
}) {
	return (
		<div className="mt-2 grid grid-cols-2 gap-4">
			{items.map((item) => (
				<FormCheckbox
					key={item.id}
					id={`item-${item.id}`}
					label={item.name}
					name="itemIds"
					value={item.id}
					checked={currentUserIds?.includes(item.id.toString())} // Convert to string for comparison
					onChange={(e) => {
						const checked = e.target.checked;
						const currentIds = currentUserIds || [];
						const itemIdString = item.id.toString(); // Convert to string

						if (checked) {
							setValue("userIds", [...currentIds, itemIdString]);
						} else {
							setValue(
								"userIds",
								currentIds.filter((id) => id !== itemIdString)
							);
						}
					}}
				/>
			))}
		</div>
	);
}
