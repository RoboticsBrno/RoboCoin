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
import { fetcher, FetchError } from "@/lib/fetch";
import { User } from "@/types";

const editUserSchema = z.object({
	login: z.string().min(1, { message: "Je vyžadováno přihlašovací jméno" }),
	name: z.string().min(1, { message: "Je vyžadováno jméno" }),
	password: z
		.string()
		.min(6, { message: "Heslo musí mít alespoň 6 znaků" })
		.or(z.literal(""))
		.optional(),
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
				const data = await fetcher<UserSelect[]>(
					`/api/users?camp_url=${camp_url}`
				);
				const filteredData = data.filter(
					(user: UserSelect) => user.id !== Number(session?.user?.id)
				);
				setUsers(filteredData);
			} catch (error) {
				if (error instanceof FetchError) {
					showError(error.info.error || "Nepodařilo se načíst uživatele");
				} else {
					showError(
						"Při načítání uživatelů došlo k neočekávané chybě."
					);
				}
				console.error("Error fetching users:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchUsers();
	}, [camp_url, showError, session?.user?.id]);

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
				isOrg:
					selectedUser.user_camp_user_camp_userTouser[0]?.is_org ||
					false,
				isAdmin:
					selectedUser.user_camp_user_camp_userTouser[0]?.is_admin ||
					false,
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

			const updatedUser = await fetcher<User>(
				`/api/users?camp_url=${camp_url}`,
				{
					method: "PUT",
					body: {
						id: selectedUser.id,
						...dataWithHashedPassword,
					},
				}
			);

			showSuccess(`Uživatel "${updatedUser.name}" úspěšně aktualizován.`);
			setSelectedUserId("");
			setSelectedUser(null);
			const usersData = await fetcher<UserSelect[]>(
				`/api/users?camp_url=${camp_url}`
			);
			setUsers(usersData);
		} catch (error) {
			if (error instanceof FetchError) {
				showError(error.info.error || "Nepodařilo se aktualizovat uživatele");
			} else {
									showError("Při aktualizaci uživatele došlo k neočekávané chybě.");			}
		}
	};

	return (
		<div>
			<FormProvider {...methods}>
				<FormContainer onSubmit={handleSubmit(onFormSubmit)}>
					<FormTitle>Upravit uživatele</FormTitle>
					<FormSubtitle>
						Vyberte uživatele a upravte jeho údaje níže.
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

					{!loading && !users.length && (
						<p className="text-center text-gray-400">
							Žádní uživatelé k zobrazení.
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
									placeholder="např. 'jirkavacha'"
								/>
							</FormGroup>

							<FormGroup>
								<FormInput
									label="Jméno"
									id="name"
									name="name"
									type="text"
									placeholder="např. 'Jirka Vacha'"
								/>
							</FormGroup>

							<FormGroup>
								<FormInput
									label="Nové heslo"
									id="password"
									name="password"
									type="password"
									autoComplete="new-password"
									placeholder="Zadejte nové heslo (volitelné)"
								/>
							</FormGroup>

							<FormGroup>
								<FormCheckbox
									label="Je organizátor"
									id="isOrg"
									name="isOrg"
									type="checkbox"
								/>
							</FormGroup>

							<FormGroup>
								<FormCheckbox
									label="Je administrátor"
									id="isAdmin"
									name="isAdmin"
									type="checkbox"
								/>
							</FormGroup>

							<FormSubmit isLoading={isSubmitting}>
								Uložit změny uživatele
							</FormSubmit>
						</>
					)}
				</FormContainer>
			</FormProvider>
		</div>
	);
}
