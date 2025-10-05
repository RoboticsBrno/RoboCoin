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

interface User {
	id: string;
	name: string;
	login: string;
}

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
			const [allManagersRes, campManagersRes] = await Promise.all([
				fetch("/api/manager/users"),
				fetch(`/api/manager/users?camp_url=${camp_url}`),
			]);

			if (!allManagersRes.ok || !campManagersRes.ok) {
				throw new Error("Failed to fetch manager data");
			}

			const allManagersData = await allManagersRes.json();
			const campData = await campManagersRes.json();

			const allManagers = allManagersData || [];
			const campManagers = campData || [];

			const campManagerIds = campManagers.map((manager: User) =>
				manager.id.toString(),
			);

			setUsers(allManagers);
			setValue("selectedUsers", campManagerIds);
		} catch (e) {
			showError("An unknown error occurred while fetching data.");
			console.error("Error fetching managers:", e);
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
				showError("Camp URL is missing.");
				return;
			}
			const res = await fetch("/api/manager/add-managers", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userIds: userIds,
					camp_url,
				}),
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || "Failed to update managers");
			}

			showSuccess("Managers updated successfully!");
			fetchManagers();
		} catch (error) {
			showError("Failed to update managers.");
			console.error("Error updating managers:", error);
		}
	};

	if (loading) return <Loader />;

	const selectedUsers = watch("selectedUsers");

	return (
		<div>
			<FormProvider {...methods}>
				<FormContainer onSubmit={handleSubmit(onFormSubmit)}>
					<FormTitle>Manage Camp Managers</FormTitle>
					<FormSubtitle>
						Select users to grant them manager permissions for this
						camp.
					</FormSubtitle>

					<FormGroup>
						<label className="block text-sm font-medium text-gray-300">
							Users
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
								<p>No managers found in the system.</p>
							)}
						</div>
					</FormGroup>

					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Updating..." : "Update Managers"}
					</Button>
				</FormContainer>
			</FormProvider>
		</div>
	);
}
