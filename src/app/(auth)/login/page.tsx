"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormContainer from "@/components/form/FormContainer";
import FormTitle from "@/components/form/FormTitle";
import FormSubtitle from "@/components/form/FormSubtitle";
import FormGroup from "@/components/form/FormGroup";
import FormInput from "@/components/form/FormInput";
import FormSubmit from "@/components/form/FormSubmit";

const loginSchema = z.object({
	login: z.string().min(1, { message: "Je vyžadováno přihlašovací jméno" }),
	password: z.string().min(1, { message: "Je vyžadováno heslo" }),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function LoginPage() {
	const [error, setError] = useState<string | null>(null);
	const methods = useForm<LoginSchema>({
		resolver: zodResolver(loginSchema),
	});
	const {
		handleSubmit,
		formState: { isSubmitting },
	} = methods;

	const onFormSubmit = async (data: LoginSchema) => {
		setError(null);
		try {
			const result = await signIn("credentials", {
				...data, camp: null,
				redirect: false,
				callbackUrl: "/",
			});

			if (result?.error) {
				if (result.error === "User not found") {
					setError(
						"Uživatel nenalezen. Zkontrolujte prosím své přihlašovací jméno a zkuste to znovu."
					);
				} else if (result.error === "Invalid password") {
					setError("Neplatné heslo. Zkuste to prosím znovu.");
				} else if (result.error === "User is not a manager") {
					setError("Nemáte oprávnění k přihlášení. Musíte být manažer.");
				} else {
					setError(
						"Došlo k neznámé chybě. Zkuste to prosím později."
					);
				}
			} else {
				try {
					window.location.href = "/";
				} catch (redirectError) {
					console.error("Error during redirect:", redirectError);
					setError("Nepodařilo se přesměrovat. Zkuste to prosím později.");
				}
			}
		} catch (error) {
			console.error("Error during login:", error);
			setError("Došlo k neočekávané chybě. Zkuste to prosím později.");
		}
	};

	return (
		<FormProvider {...methods}>
			<FormContainer onSubmit={handleSubmit(onFormSubmit)}>
				<FormTitle>Přihlášení k manažerskému účtu</FormTitle>
				<FormSubtitle>
					Vítejte zpět! Zadejte prosím své údaje.
				</FormSubtitle>
				{error && (
					<p className="text-sm text-center text-red-500">{error}</p>
				)}
				<FormGroup>
					<FormInput
						label="Přihlašovací jméno"
						id="login"
						name="login"
						type="text"
						autoComplete="login"
					/>
				</FormGroup>
				<FormGroup>
					<FormInput
						label="Heslo"
						id="password"
						name="password"
						type="password"
						autoComplete="current-password"
					/>
				</FormGroup>
				<FormSubmit isLoading={isSubmitting}>Přihlásit se</FormSubmit>
				<p className="text-sm text-center text-gray-400">
					Nemáte účet?{" "}
					<Link
						href="/signup"
						className="font-medium text-indigo-500 hover:text-indigo-400"
					>
						Zaregistrujte se
					</Link>
				</p>
			</FormContainer>
		</FormProvider>
	);
}
