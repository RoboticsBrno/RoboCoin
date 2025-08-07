"use client";

import { z } from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormContainer from "@/components/form/FormContainer";
import FormTitle from "@/components/form/FormTitle";
import FormSubtitle from "@/components/form/FormSubtitle";
import FormGroup from "@/components/form/FormGroup";
import FormSubmit from "@/components/form/FormSubmit";
import Alert from "@/components/Alert";
import { useState, useEffect } from "react";
import FormSelect from "@/components/form/FormSelect";
import Loader from "@/components/Loader";
import { UserSelect } from "@/lib/api";

const deleteUserSchema = z.object({
	userId: z.string().min(1, { message: "User is required" }),
});

type DeleteUserSchema = z.infer<typeof deleteUserSchema>;

export default function DeleteUserPage() {
	const [loading, setLoading] = useState<boolean>(true);
	const [message, setMessage] = useState<string | null>(null);
	const [messageType, setMessageType] = useState<"success" | "danger">(
		"success"
	);
	const [users, setUsers] = useState<UserSelect[]>([]);
	const [selectedUserId, setSelectedUserId] = useState("");

	const methods = useForm<DeleteUserSchema>({
		resolver: zodResolver(deleteUserSchema),
	});
	const {
		handleSubmit,
		formState: { isSubmitting },
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

	const onFormSubmit = async (data: DeleteUserSchema) => {
		try {
			const response = await fetch(`/api/users`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: data.userId }),
			});

			if (response.ok) {
				setMessage(`User deleted successfully!`);
				setMessageType("success");
				setSelectedUserId("");
				// Refresh users list
				const userResponse = await fetch("/api/users");
				const usersData = await userResponse.json();
				setUsers(usersData);
			} else {
				const errorData = await response.json();
				setMessage(errorData.error || "Failed to delete user");
				setMessageType("danger");
			}
		} catch (error) {
			setMessage("An unexpected error occurred while deleting user.");
			setMessageType("danger");
		}
	};

	return (
		<div>
			{message && <Alert variant={messageType} message={message} />}
			<FormProvider {...methods}>
				<FormContainer onSubmit={handleSubmit(onFormSubmit)}>
					<FormTitle>Delete User</FormTitle>
					<FormSubtitle>
						Select a user to delete them from the system.
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
					<FormSubmit
						isLoading={isSubmitting}
						className="bg-red-600 hover:bg-red-700"
					>
						Delete User
					</FormSubmit>
				</FormContainer>
			</FormProvider>
		</div>
	);
}
