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
import FormCheckbox from "@/components/form/FormCheckbox";
import { useToast } from "@/components/Toast";
import { fetcher, FetchError } from "@/lib/fetch";
import { SignupResponse } from "@/types";
import { useSession } from "next-auth/react";

const createUserSchema = z.object({
	login: z.string().min(1, { message: "Je vyžadováno přihlašovací jméno" }),
	name: z.string().min(1, { message: "Je vyžadováno jméno" }),
	password: z
		.string()
		.min(6, { message: "Heslo musí mít alespoň 6 znaků" }),
	isOrg: z.boolean(),
	isAdmin: z.boolean(),
	camp_url: z.string(),
});

type CreateUserSchema = z.infer<typeof createUserSchema>;

export default function CreateUserPage() {
	const { data: session } = useSession();
	const methods = useForm<CreateUserSchema>({
		resolver: zodResolver(createUserSchema),
		defaultValues: {
			login: "",
			name: "",
			password: "",
			isOrg: false,
			isAdmin: false,
			camp_url: session?.camp_url || "",
		},
	});
	const {
		handleSubmit,
		formState: { isSubmitting },
	} = methods;

	const { showError, showSuccess } = useToast();

	const onFormSubmit = async (data: CreateUserSchema) => {
		try {
			const newUser = await fetcher<SignupResponse>("/api/signup", {
				method: "POST",
				body: data,
			});

			showSuccess(`Uživatel "${newUser.user.name}" úspěšně vytvořen.`);
			methods.reset();
		} catch (error) {
			if (error instanceof FetchError) {
				showError(error.info.error || "Nepodařilo se vytvořit uživatele");
			} else {
				showError("Při vytváření uživatele došlo k neočekávané chybě.");
			}
		}
	};

	return (
		<div>
			<FormProvider {...methods}>
				<FormContainer onSubmit={handleSubmit(onFormSubmit)}>
					<FormTitle>Vytvořit nového uživatele</FormTitle>
					<FormSubtitle>
						Vyplňte následující formulář pro vytvoření nového
						uživatele.
					</FormSubtitle>

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
							label="Heslo"
							id="password"
							name="password"
							type="password"
							autoComplete="new-password"
							placeholder="Zadejte bezpečné heslo"
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
						Vytvořit uživatele
					</FormSubmit>
				</FormContainer>
			</FormProvider>
		</div>
	);
}
