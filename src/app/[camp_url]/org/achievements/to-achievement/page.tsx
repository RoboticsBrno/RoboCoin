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
import { fetcher, FetchError } from "@/lib/fetch";
import { User, Item, SyncAchievementResponse } from "@/types";
import { useCurrencySymbol } from "@/hooks/useCurrencySymbol";

const syncSchema = z.object({
	itemId: z.string().min(1, { message: "Prosím vyberte úspěch" }),
	userIds: z.array(z.string()).refine(
		(arr) => {
			return arr.every((id) => !isNaN(Number(id)) && Number(id) > 0);
		},
		{ message: "Všechna ID uživatelů musí být platná čísla" }
	),
});

type SyncSchema = z.infer<typeof syncSchema>;

export default function ManageAchievementUsersPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [items, setItems] = useState<Item[]>([]);
	const [selectedItemId, setSelectedItemId] = useState<string>("");
	const [isLoading, setIsLoading] = useState(true);
	const [isOwnersLoading, setIsOwnersLoading] = useState(false);
	const campCurrency = useCurrencySymbol();
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
	const currentUserIds = watch("userIds");

	const { showError, showSuccess } = useToast();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [users, items] = await Promise.all([
					fetcher<User[]>("/api/users"),
					fetcher<Item[]>("/api/items"),
				]);
				setUsers(users);
				setItems(items);
			} catch (error) {
				if (error instanceof FetchError) {
					showError(error.info.error || "Nepodařilo se načíst data");
				} else {
					showError("Nepodařilo se načíst data");
				}
				console.error("Nepodařilo se načíst data:", error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchData();
	}, [showError]);

	useEffect(() => {
		if (!selectedItemId) {
			setValue("userIds", []);
			return;
		}

		const fetchItemOwners = async () => {
			setIsOwnersLoading(true);
			try {
				const ownerIds = await fetcher<number[]>(
					`/api/inventory/item/${selectedItemId}`
				);
				setValue(
					"userIds",
					ownerIds.map((id) => id.toString())
				);
			} catch (error) {
				if (error instanceof FetchError) {
					showError(
						error.info.error || "Nepodařilo se načíst vlastníky předmětu"
					);
				} else {
					showError("Nepodařilo se načíst vlastníky předmětu");
				}
				console.error("Failed to fetch item owners:", error);
			} finally {
				setIsOwnersLoading(false);
			}
		};

		fetchItemOwners();
	}, [selectedItemId, setValue, showError]);

	const onFormSubmit = async (data: SyncSchema) => {
		try {
			const submitData = {
				itemId: data.itemId,
				userIds: data.userIds.map((id) => Number(id)), // Convert to numbers here
			};
			await fetcher<SyncAchievementResponse>(
				"/api/inventory/to-achievement",
				{
					method: "POST",
					body: submitData,
				}
			);

			showSuccess("Držitelé úspěchů byli úspěšně synchronizováni!");
			setValue("itemId", ""); // Reset item selection
			setSelectedItemId("");
		} catch (error) {
			if (error instanceof FetchError) {
				showError(
					error.info.error || "Nepodařilo se synchronizovat držitele úspěchů"
				);
			} else {
							showError(
								"Při aktualizaci vlastníků došlo k neočekávané chybě."
							);			}
		}
	};

	if (isLoading) {
		return <Loader />;
	}

	return (
		<div>
			<FormProvider {...methods}>
				<FormContainer onSubmit={handleSubmit(onFormSubmit)}>
					<FormTitle>Přidejte uživatele k úspechu</FormTitle>
					<FormSubtitle>
						Vyberte úspěch a poté vyberte uživatele, kteří by jej
						měli vlastnit.
					</FormSubtitle>

					<FormGroup>
						<FormSelect
							label="Úspěch"
							name="itemId"
							options={items.map((item) => ({
								value: item.id.toString(),
								label:
									item.title +
									` (${item.price} ${campCurrency})`,
							}))}
							onChange={(e) => setSelectedItemId(e.target.value)}
						/>
					</FormGroup>

					<FormGroup>
						<label className="block text-sm font-medium text-gray-300">
							Uživatelé {isOwnersLoading ? "(načítá se)" : ""}
						</label>
						{!selectedItemId ? (
							<p className="text-gray-500 text-sm mt-1">
								Nejprve vyberte úspěch pro zobrazení jeho
								vlastníků.
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
						Aktualizovat držitele úspěchu
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
					value={item.id.toString()}
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
