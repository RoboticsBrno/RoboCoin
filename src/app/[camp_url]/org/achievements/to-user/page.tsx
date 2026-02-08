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
import { useCurrencySymbol } from "@/hooks/useCurrencySymbol";

const syncSchema = z.object({
	userId: z.string().min(1, { message: "Prosím vyberte uživatele" }),
	itemIds: z.array(z.string()).refine(
		(arr) => {
			return arr.every((id) => !isNaN(Number(id)) && Number(id) > 0);
		},
		{ message: "Všechna ID předmětů musí být platná čísla" }
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
				);
			} catch (error) {
				if (error instanceof FetchError) {
					showError(
						error.info.error || "Nepodařilo se načíst inventář uživatele"
					);
				} else {
					showError("Nepodařilo se načíst inventář uživatele");
				}
				console.error("Nepodařilo se načíst inventář uživatele:", error);
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
				itemIds: data.itemIds.map((id) => Number(id)),
			};

			await fetcher<SyncUserInventoryResponse>("/api/inventory/to-user", {
				method: "POST",
				body: submitData,
			});

			showSuccess("Úspěchy úspěšně aktualizovány!");
			setValue("userId", "");
			setSelectedUserId("");
		} catch (error) {
			if (error instanceof FetchError) {
				showError(error.info.error || "Nepodařilo se synchronizovat úspěchy");
			} else {
				showError(
					"Při aktualizaci úspěchů došlo k neočekávané chybě."
				);
			}
			console.error("Došlo k neočekávané chybě:", error);
		}
	};

	if (isLoading) {
		return <Loader />;
	}

	return (
		<div>
			<FormProvider {...methods}>
				<FormContainer onSubmit={handleSubmit(onFormSubmit)}>
					<FormTitle>Přidejte úspěchy uživateli</FormTitle>
					<FormSubtitle>
						Vyberte uživatele a upravte jeho úspěchy výběrem z
						dostupných možností níže.
					</FormSubtitle>

					<FormGroup>
						<FormSelect
							label="Uživatel"
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
							Úspěchy uživatele
							{isInventoryLoading ? " (načítá se)" : null}
						</label>
						{!selectedUserId ? (
							<p className="text-gray-500 text-sm mt-1">
								Nejprve vyberte uživatele pro zobrazení jeho
								úspěchů.
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
						Aktualizovat úspěchy uživatele
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
	const campCurrency = useCurrencySymbol();
	return (
		<div className="mt-2 grid grid-cols-2 gap-4">
			{items.map((item) => (
				<FormCheckbox
					key={item.id}
					id={`item-${item.id}`}
					label={`${item.title} (${item.price} ${campCurrency})`}
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
