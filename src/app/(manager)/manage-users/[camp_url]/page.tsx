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

interface User {
	id: string;
	name: string;
	login: string;
}

interface IForm {
	selectedUsers: string[];
}

export default function ManageUsersPage() {
	const params = useParams();
	const { camp_url } = params;

	const methods = useForm<IForm>({
		defaultValues: {
			selectedUsers: [],
		},
	});

	const { data: session } = useSession();

	const { showError, showSuccess } = useToast();

	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchUsers = useCallback(async () => {
		if (!camp_url || !session) return;
		setLoading(true);
		try {
			const allUsersRes = await fetch("/api/users");
			const campUsersRes = await fetch(
				`/api/users?camp_url=${camp_url}`,
			);

			if (!allUsersRes.ok || !campUsersRes.ok) {
				throw new Error("Nepodařilo se načíst data uživatelů");
			}

			const allUsersData = await allUsersRes.json();
			const campUsersData = await campUsersRes.json();

			const allUsers = allUsersData || [];
			const campUsers = campUsersData || [];


			const filteredUsers = allUsers.filter(
				(user: User) => user.id != session.user.id,
			);
			const campUserIds = campUsers.map((user: User) => user.id);

			setUsers(filteredUsers);
			methods.setValue("selectedUsers", campUserIds);
		} catch (e) {
			showError("Došlo k neznámé chybě");
			console.error("Error fetching users:", e);
		} finally {
			setLoading(false);
		}
	}, [camp_url, showError, methods, session]);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	const handleSubmit = async (data: IForm) => {
		if (data.selectedUsers.length === 0) {
			showError("Vyberte prosím alespoň jednoho uživatele.");
			return;
		}

		try {
			const res = await fetch("/api/manager/users", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userIds: data.selectedUsers, camp_url }),
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || "Nepodařilo se přiřadit uživatele");
			}

			showSuccess("Uživatelé byli úspěšně přiřazeni!");
			fetchUsers();
		} catch (error) {
			showError("Nepodařilo se přiřadit uživatele.");
			console.error("Error assigning users:", error);
		}
	};

	if (loading) return <Loader />;

	const selectedUsers = methods.watch("selectedUsers");

	return (
		<>
			<FormProvider {...methods}>
				<FormContainer onSubmit={methods.handleSubmit(handleSubmit)}>
					<FormTitle>Přiřadit uživatele do {camp_url}</FormTitle>
					<FormGroup>
						<label className="block text-sm font-medium text-gray-300">
							Uživatelé
						</label>
						{users.length > 0 ? (
							users.map((user) => (
								<FormCheckbox
									id={user.id}
									key={user.id}
									label={`${user.name} (${user.login})`}
									value={user.id}
									name="selectedUsers"
									checked={selectedUsers?.includes(user.id)}
									onChange={(e) => {
										const checked = e.target.checked;
										const currentIds = selectedUsers || [];
										const userId = user.id;

										if (checked) {
											methods.setValue("selectedUsers", [...currentIds, userId]);
										} else {
											methods.setValue(
												"selectedUsers",
												currentIds.filter((id) => id !== userId),
											);
										}
									}}
								/>
							))
						) : (
							<p>V systému nebyli nalezeni žádní uživatelé.</p>
						)}
					</FormGroup>
					<Button type="submit" disabled={selectedUsers.length === 0}>
						Přiřadit vybrané uživatele
					</Button>
				</FormContainer>
			</FormProvider>
		</>
	);
}
