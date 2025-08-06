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
import Alert from "@/components/Alert";
import { useState, useEffect } from "react";
import FormCheckbox from "@/components/form/FormCheckbox";
import { User } from "@/types";
import FormSelect from "@/components/form/FormSelect";

const editUserSchema = z.object({
	login: z.string().min(1, { message: "Login is required" }),
	name: z.string().min(1, { message: "Name is required" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters" })
		.optional()
		.or(z.literal("")),
	isOrg: z.boolean().default(false),
	isAdmin: z.boolean().default(false),
});

type EditUserSchema = z.infer<typeof editUserSchema>;

export default function EditUserPage() {
	const [message, setMessage] = useState<string | null>(null);
	const [messageType, setMessageType] = useState<"success" | "danger">(
		"success"
	);
	const [users, setUsers] = useState<User[]>([]);
	const [selectedUserId, setSelectedUserId] = useState("");
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	const methods = useForm<EditUserSchema>({
		resolver: zodResolver(editUserSchema),
	});
	const {
		handleSubmit,
		formState: { isSubmitting },
		reset,
	} = methods;

	useEffect(() => {
		const fetchUsers = async () => {
			setLoading(true);
			try {
				const response = await fetch("/api/users");
				if (response.ok) {
					const data = await response.json();
					setUsers(data);
				} else {
					setMessage("Failed to fetch users");
					setMessageType("danger");
				}
				setLoading(false);
			} catch (error) {
				setMessage(
					"An unexpected error occurred while fetching users."
				);
				setMessageType("danger");
				setLoading(false);
			}
		};
		fetchUsers();
	}, []);

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
				isOrg: selectedUser.is_org,
				isAdmin: selectedUser.is_admin,
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
			const response = await fetch(`/api/users`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: selectedUser.id, ...data }),
			});

			if (response.ok) {
				const updatedUser = await response.json();
				setMessage(`User "${updatedUser.name}" updated successfully!`);
				setMessageType("success");
				setSelectedUserId("");
				setSelectedUser(null);
				// Refresh users list
				const userResponse = await fetch("/api/users");
				const usersData = await userResponse.json();
				setUsers(usersData);
			} else {
				const errorData = await response.json();
				setMessage(errorData.error || "Failed to update user");
				setMessageType("danger");
			}
		} catch (error: any) {
			setMessage("An unexpected error occurred while updating user.");
			setMessageType("danger");
		}
	};

	return (
		<div>
			{message && <Alert variant={messageType} message={message} />}
			<FormProvider {...methods}>
				<FormContainer onSubmit={handleSubmit(onFormSubmit)}>
					<FormTitle>Edit User</FormTitle>
					<FormSubtitle>
						Select a user to edit their details.
					</FormSubtitle>
					{loading ? (
						<p className="text-center text-gray-400">
							Loading users...
						</p>
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
