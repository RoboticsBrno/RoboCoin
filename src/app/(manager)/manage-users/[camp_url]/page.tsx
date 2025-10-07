"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import PageTitle from "@/components/PageTitle";
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
				throw new Error("Failed to fetch user data");
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
			showError("An unknown error occurred");
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
			showError("Please select at least one user.");
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
				throw new Error(errorData.error || "Failed to assign users");
			}

			showSuccess("Users assigned successfully!");
			fetchUsers();
		} catch (error) {
			showError("Failed to assign users.");
			console.error("Error assigning users:", error);
		}
	};

	if (loading) return <Loader />;

	const selectedUsers = methods.watch("selectedUsers");

	return (
		<>
			<FormProvider {...methods}>
				<FormContainer onSubmit={methods.handleSubmit(handleSubmit)}>
					<FormTitle>Assign Users to {camp_url}</FormTitle>
					<FormGroup>
						<label className="block text-sm font-medium text-gray-300">
							Users
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
							<p>No users found in the system.</p>
						)}
					</FormGroup>
					<Button type="submit" disabled={selectedUsers.length === 0}>
						Assign Selected Users
					</Button>
				</FormContainer>
			</FormProvider>
		</>
	);
}
