"use client";

import { z } from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormContainer from "@/components/form/FormContainer";
import FormTitle from "@/components/form/FormTitle";
import FormSubtitle from "@/components/form/FormSubtitle";
import FormGroup from "@/components/form/FormGroup";
import FormInput from "@/components/form/FormInput";
import FormSubmit from "@/components/form/FormSubmit";
import { useState, useEffect } from "react";
import FormCheckbox from "@/components/form/FormCheckbox";
import FormSelect from "@/components/form/FormSelect";
import Loader from "@/components/Loader";
import { UserSelect } from "@/lib/api";
import bcrypt from "bcryptjs";
import { useToast } from "@/components/Toast";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

const editUserSchema = z.object({
	login: z.string().min(1, { message: "Login is required" }),
	name: z.string().min(1, { message: "Name is required" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters" })
		.optional()
		.or(z.literal("")),
	isOrg: z.boolean(),
	isAdmin: z.boolean(),
});

type EditUserSchema = z.infer<typeof editUserSchema>;

export default function EditUserPage() {
	const { camp_url } = useParams<{ camp_url: string }>();
	const [users, setUsers] = useState<UserSelect[]>([]);
	const [selectedUserId, setSelectedUserId] = useState("");
	const [selectedUser, setSelectedUser] = useState<UserSelect | null>(null);
	const [loading, setLoading] = useState(true);

	const { showError, showSuccess } = useToast();

	const methods = useForm<EditUserSchema>({
		resolver: zodResolver(editUserSchema),
		defaultValues: {
			login: "",
			name: "",
			password: "",
			isOrg: false,
			isAdmin: false,
		},
	});
	const {
		handleSubmit,
		formState: { isSubmitting },
		reset,
	} = methods;

	const { data: session } = useSession();

	useEffect(() => {
		const fetchUsers = async () => {
			if (!camp_url) return;
			setLoading(true);
			try {
				const response = await fetch(`/api/users?camp_url=${camp_url}`);
				if (response.ok) {
					const data = await response.json();
					const filteredData = data.filter((user: UserSelect) => user.id !== Number(session?.user?.id));
					setUsers(filteredData);
				} else {
					showError("Failed to fetch users");
				}
				setLoading(false);
			} catch (error) {
				showError("An unexpected error occurred while fetching users.");
				console.error("Error fetching users:", error);
				setLoading(false);
			}
		};
		fetchUsers();
	}, [camp_url, showError]);

	useEffect(() => {
		const user =
			users.find((u) => u.id === parseInt(selectedUserId, 10)) || null;
		setSelectedUser(user);
	}, [selectedUserId, users]);

	useEffect(() => {
		if (selectedUser) {
			reset({
				login: selectedUser.login,
				name: selectedUser.name,
				isOrg: selectedUser.user_camp_user_camp_userTouser[0]?.is_org || false,
				isAdmin: selectedUser.user_camp_user_camp_userTouser[0]?.is_admin || false,
				password: "",
			});
		} else {
			reset({
				login: "",
				name: "",
				password: "",
				isOrg: false,
				isAdmin: false,
			});
		}
	}, [selectedUser, reset]);

	const onFormSubmit = async (data: EditUserSchema) => {
		if (!selectedUser) return;

		try {
			const dataWithHashedPassword = { ...data };

			if (data.password) {
				const hashedPassword = await bcrypt.hash(data.password, 10);
				dataWithHashedPassword.password = hashedPassword;
			} else {
				delete dataWithHashedPassword.password;
			}

			const response = await fetch(`/api/users?camp_url=${camp_url}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					id: selectedUser.id,
					...dataWithHashedPassword,
				}),
			});

			if (response.ok) {
				const updatedUser = await response.json();
				showSuccess(`User "${updatedUser.name}" updated successfully!`);
				setSelectedUserId("");
				setSelectedUser(null);
				const userResponse = await fetch(
					`/api/users?camp_url=${camp_url}`,
				);
				const usersData = await userResponse.json();
				setUsers(usersData);
			} else {
				const errorData = await response.json();
				showError("Failed to update user");
				console.error("Update error:", errorData.error);
			}
		} catch (error) {
			showError("An unexpected error occurred while updating user.");
		}
	};

	return (
		<div>
			<FormProvider {...methods}>
				<FormContainer onSubmit={handleSubmit(onFormSubmit)}>
					<FormTitle>Edit User</FormTitle>
					<FormSubtitle>
						Select a user to edit their details.
					</FormSubtitle>
					{loading ? (
						<Loader />
					) : (
						<FormGroup>
							<FormSelect
								label="User"
								name="userId"
								options={users.map((user) => ({
									value: user.id,
									label: `${user.name} (${user.login})`,
								}))}
								value={selectedUserId}
								onChange={(e) =>
									setSelectedUserId(e.target.value)
								}
							/>
						</FormGroup>
					)}

					{!loading && !users.length && (
						<p className="text-center text-gray-400">
							No users found.
						</p>
					)}

					{selectedUser && (
						<>
							<FormGroup>
								<FormInput
									label="Login"
									id="login"
									name="login"
									type="text"
									placeholder="e.g., 'jirkavacha'"
								/>
							</FormGroup>

							<FormGroup>
								<FormInput
									label="Name"
									id="name"
									name="name"
									type="text"
									placeholder="e.g., 'Jirka Vacha'"
								/>
							</FormGroup>

							<FormGroup>
								<FormInput
									label="New Password"
									id="password"
									name="password"
									type="password"
									autoComplete="new-password"
									placeholder="Enter a new password (optional)"
								/>
							</FormGroup>

							<FormGroup>
								<FormCheckbox
									label="Is Org"
									id="isOrg"
									name="isOrg"
									type="checkbox"
								/>
							</FormGroup>

							<FormGroup>
								<FormCheckbox
									label="Is Admin"
									id="isAdmin"
									name="isAdmin"
									type="checkbox"
								/>
							</FormGroup>

							<FormSubmit isLoading={isSubmitting}>
								Save Changes
							</FormSubmit>
						</>
					)}
				</FormContainer>
			</FormProvider>
		</div>
	);
}
