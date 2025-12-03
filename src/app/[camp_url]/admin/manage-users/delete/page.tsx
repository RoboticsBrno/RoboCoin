"use client";

import { z } from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormContainer from "@/components/form/FormContainer";
import FormTitle from "@/components/form/FormTitle";
import FormSubtitle from "@/components/form/FormSubtitle";
import FormGroup from "@/components/form/FormGroup";
import FormSubmit from "@/components/form/FormSubmit";
import { useState, useEffect } from "react";
import FormSelect from "@/components/form/FormSelect";
import Loader from "@/components/Loader";
import { useToast } from "@/components/Toast";
import { fetcher, FetchError } from "@/lib/fetch";
import { UserSelect } from "@/lib/api";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { DeleteUserResponse } from "@/types";

const deleteUserSchema = z.object({
	userId: z.string().min(1, { message: "User is required" }),
});

type DeleteUserSchema = z.infer<typeof deleteUserSchema>;

export default function DeleteUserPage() {
	const { camp_url } = useParams<{ camp_url: string }>();
	const [loading, setLoading] = useState<boolean>(true);
	const [users, setUsers] = useState<UserSelect[]>([]);
	const [selectedUserId, setSelectedUserId] = useState("");

	const methods = useForm<DeleteUserSchema>({
		resolver: zodResolver(deleteUserSchema),
	});
	const {
		handleSubmit,
		formState: { isSubmitting },
	} = methods;

	const { data: session } = useSession();

	const { showError, showSuccess } = useToast();

	useEffect(() => {
		const fetchUsers = async () => {
			if (!camp_url) return;
			setLoading(true);
			try {
				const data = await fetcher<UserSelect[]>(
					`/api/users?camp_url=${camp_url}`
				);

				const sessionUserId = session?.user?.id;
				const filteredData = data.filter(
					(user) => user.id !== parseInt(sessionUserId || "-1", 10)
				);

				setUsers(filteredData);
			} catch (error) {
				if (error instanceof FetchError) {
					showError(error.info.error || "Failed to fetch users");
				} else {
					showError(
						"An unexpected error occurred while fetching users."
					);
					console.error(error);
				}
			} finally {
				setLoading(false);
			}
		};
		fetchUsers();
	}, [showError, camp_url, session?.user?.id]);

	const onFormSubmit = async (data: DeleteUserSchema) => {
		try {
			await fetcher<DeleteUserResponse>(
				`/api/users?camp_url=${camp_url}`,
				{
					method: "DELETE",
					body: { id: data.userId },
				}
			);
			showSuccess("User deleted successfully!");
			setSelectedUserId("");
			const usersData = await fetcher<UserSelect[]>(
				`/api/users?camp_url=${camp_url}`
			);
			setUsers(usersData);
			methods.reset();
		} catch (error) {
			if (error instanceof FetchError) {
				showError(error.info.error || "Failed to delete user");
				console.error("Delete user error:", error.info);
			} else {
				showError("An unexpected error occurred while deleting user.");
			}
		}
	};

	return (
		<div>
			<FormProvider {...methods}>
				<FormContainer onSubmit={handleSubmit(onFormSubmit)}>
					<FormTitle>Smazat uživatele</FormTitle>
					<FormSubtitle>
						Vyberte uživatele, kterého chcete smazat.
					</FormSubtitle>
					{loading ? (
						<Loader />
					) : (
						<FormGroup>
							<FormSelect
								label="Uživatel"
								name="userId"
								options={users.map((user) => ({
									value: user.id.toString(),
									label: `${user.name} (${user.login})`,
								}))}
								value={selectedUserId}
								onChange={(e) =>
									setSelectedUserId(e.target.value)
								}
							/>
						</FormGroup>
					)}
					{selectedUserId && (
						<h1 className="text-red-500 text-lg">
							Opravdu chcete smazat tohoto uživatele? Tato akce je
							nevratná!
						</h1>
					)}
					{selectedUserId && (
						<FormSubmit
							isLoading={isSubmitting}
							className="bg-red-600 hover:bg-red-700"
						>
							Smazat uživatele
						</FormSubmit>
					)}
				</FormContainer>
			</FormProvider>
		</div>
	);
}
