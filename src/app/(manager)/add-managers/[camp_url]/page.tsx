"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import Button from "@/components/Button";
import FormContainer from "@/components/form/FormContainer";
import FormGroup from "@/components/form/FormGroup";
import Loader from "@/components/Loader";
import FormCheckbox from "@/components/form/FormCheckbox";
import { useToast } from "@/components/Toast";
import { useSession } from "next-auth/react";
import FormTitle from "@/components/form/FormTitle";
import FormSubtitle from "@/components/form/FormSubtitle";
import { fetcher, FetchError } from "@/lib/fetch";
import { AddManagersResponse, User } from "@/types";

interface IForm {
	selectedUsers: string[];
}

export default function AddManagersPage() {
	const params = useParams();
	const { camp_url } = params;

	const methods = useForm<IForm>({
		defaultValues: {
			selectedUsers: [],
		},
	});

	const {
		handleSubmit,
		setValue,
		watch,
		formState: { isSubmitting },
	} = methods;

	const { data: session } = useSession();
	const { showError, showSuccess } = useToast();

	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchManagers = useCallback(async () => {
		if (!camp_url || !session) return;
		setLoading(true);
		try {
			const [allManagers, campManagers] = await Promise.all([
				fetcher<User[]>("/api/manager/users"),
				fetcher<User[]>(`/api/manager/users?camp_url=${camp_url}`),
			]);

			const campManagerIds = campManagers.map((manager) =>
				manager.id.toString(),
			);

			setUsers(allManagers);
			setValue("selectedUsers", campManagerIds);
		} catch (e) {
			if (e instanceof FetchError) {
				showError(e.info.error || "Při načítání dat došlo k neznámé chybě.");
			} else {
				showError("Při načítání dat došlo k neznámé chybě.");
				console.error("Error fetching managers:", e);
			}
		} finally {
			setLoading(false);
		}
	}, [camp_url, showError, setValue, session]);

	useEffect(() => {
		fetchManagers();
	}, [fetchManagers]);

	const onFormSubmit = async (data: IForm) => {
		try {
			const userIds = data.selectedUsers.map((id) => parseInt(id, 10));
			if (!camp_url) {
				showError("Chybí URL tábora.");
				return;
			}
			await fetcher<AddManagersResponse>("/api/manager/add-managers", {
				method: "POST",
				body: {
					userIds: userIds,
					camp_url,
				},
			});

			showSuccess("Manažeři byli úspěšně aktualizováni!");
			fetchManagers();
		} catch (error) {
			if (error instanceof FetchError) {
				showError(error.info.error || "Nepodařilo se aktualizovat manažery.");
			} else {
				showError("Nepodařilo se aktualizovat manažery.");
				console.error("Error updating managers:", error);
			}
		}
	};

	if (loading) return <Loader />;

	const selectedUsers = watch("selectedUsers");

	return (
		<div>
			<FormProvider {...methods}>
				<FormContainer onSubmit={handleSubmit(onFormSubmit)}>
					<FormTitle>Spravovat manažery tábora</FormTitle>
					<FormSubtitle>
						Vyberte uživatele, kterým chcete udělit oprávnění manažera pro tento tábor.
					</FormSubtitle>

					<FormGroup>
						<label className="block text-sm font-medium text-gray-300">
							Uživatelé
						</label>
						<div className="mt-2 grid grid-cols-2 gap-4">
							{users.length > 0 ? (
								users.map((user) => {
									const isCurrentUser =
										session?.user?.id?.toString() ===
										user.id.toString();
									return (
										<FormCheckbox
											key={user.id}
											id={`user-${user.id}`}
											label={`${user.name} (${user.login})`}
											name="selectedUsers"
											value={user.id.toString()}
											checked={
												selectedUsers?.includes(
													user.id.toString(),
												) || isCurrentUser
											}
											disabled={isCurrentUser}
											onChange={(e) => {
												const checked = e.target.checked;
												const currentIds =
													selectedUsers || [];
												const userIdString =
													user.id.toString();

												if (checked) {
													setValue("selectedUsers", [
														...currentIds,
														userIdString,
													]);
												} else {
													setValue(
														"selectedUsers",
														currentIds.filter(
															(id) =>
																id !==
																userIdString,
														),
													);
												}
											}}
										/>
									);
								})
							) : (
								<p>V systému nebyli nalezeni žádní manažeři.</p>
							)}
						</div>
					</FormGroup>

					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Aktualizuji..." : "Aktualizovat manažery"}
					</Button>
				</FormContainer>
			</FormProvider>
		</div>
	);
}
