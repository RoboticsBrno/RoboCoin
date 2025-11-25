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
import Loader from "@/components/Loader";
import { useToast } from "@/components/Toast";
import { useParams } from "next/navigation";
import { fetcher, FetchError } from "@/lib/fetch";
import { User, Item, SyncUserInventoryResponse } from "@/types";

const syncSchema = z.object({
	userId: z.string().min(1, { message: "Please select a user" }),
	itemIds: z.array(z.string()).refine(
		(arr) => {
			return arr.every((id) => !isNaN(Number(id)) && Number(id) > 0);
		},
		{ message: "All item IDs must be valid numbers" }
	),
});

type SyncSchema = z.infer<typeof syncSchema>;

export default function ManageUserAchievementsPage() {
	const { camp_url } = useParams<{ camp_url: string }>();
	const [users, setUsers] = useState<User[]>([]);
	const [items, setItems] = useState<Item[]>([]);
	const [selectedUserId, setSelectedUserId] = useState<string>("");
	const [isLoading, setIsLoading] = useState(true);
	const [isInventoryLoading, setIsInventoryLoading] = useState(false);
	const methods = useForm<SyncSchema>({
		resolver: zodResolver(syncSchema),
		defaultValues: { userId: "", itemIds: [] },
	});

	const { showError, showSuccess } = useToast();

	const {
		handleSubmit,
		setValue,
		watch,
		formState: { isSubmitting },
	} = methods;

	const currentItemIds = watch("itemIds");

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [users, items] = await Promise.all([
					fetcher<User[]>("/api/users?camp_url=" + camp_url),
					fetcher<Item[]>("/api/items"),
				]);
				setUsers(users);
				setItems(items);
			} catch (error) {
				if (error instanceof FetchError) {
					showError(error.info.error || "Failed to fetch data");
				} else {
					showError("Failed to fetch data");
				}
				console.error("Failed to fetch data:", error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchData();
	}, [camp_url, showError]);

	useEffect(() => {
		if (!selectedUserId) {
			setValue("itemIds", []);
			return;
		}

		const fetchUserInventory = async () => {
			setIsInventoryLoading(true);
			try {
				const ownedItemIds = await fetcher<number[]>(
					`/api/inventory/user/${selectedUserId}`
				);
				setValue(
					"itemIds",
					ownedItemIds.map((id) => id.toString())
				); // Convert to strings for the form
			} catch (error) {
				if (error instanceof FetchError) {
					showError(
						error.info.error || "Failed to fetch user inventory"
					);
				} else {
					showError("Failed to fetch user inventory");
				}
				console.error("Failed to fetch user inventory:", error);
			} finally {
				setIsInventoryLoading(false);
			}
		};

		fetchUserInventory();
	}, [selectedUserId, setValue, showError]);

	const onFormSubmit = async (data: SyncSchema) => {
		try {
			const submitData = {
				userId: data.userId,
				itemIds: data.itemIds.map((id) => Number(id)), // Convert to numbers for API
			};

			await fetcher<SyncUserInventoryResponse>("/api/inventory/to-user", {
				method: "POST",
				body: submitData,
			});

			showSuccess("Achievements updated successfully!");
			setValue("userId", "");
			setSelectedUserId("");
		} catch (error) {
			if (error instanceof FetchError) {
				showError(error.info.error || "Failed to sync achievements");
			} else {
				showError(
					"An unexpected error occurred while updating achievements."
				);
			}
			console.error("An unexpected error occurred:", error);
		}
	};

	if (isLoading) {
		return <Loader />;
	}

	return (
		<div>
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
								value: user.id.toString(),
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
	currentItemIds: string[] | undefined;
	setValue: UseFormSetValue<{ userId: string; itemIds: string[] }>;
}) {
	return (
		<div className="mt-2 grid grid-cols-2 gap-4">
			{items.map((item) => (
				<FormCheckbox
					key={item.id}
					id={`item-${item.id}`}
					label={`${item.title} (${item.price})`}
					name="itemIds"
					value={item.id.toString()}
					checked={currentItemIds?.includes(item.id.toString())}
					onChange={(e) => {
						const checked = e.target.checked;
						const currentIds = currentItemIds || [];
						const itemIdString = item.id.toString();

						if (checked) {
							setValue("itemIds", [...currentIds, itemIdString]);
						} else {
							setValue(
								"itemIds",
								currentIds.filter((id) => id !== itemIdString)
							);
						}
					}}
				/>
			))}
		</div>
	);
}
