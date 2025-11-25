"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormContainer from "@/components/form/FormContainer";
import FormTitle from "@/components/form/FormTitle";
import FormSubtitle from "@/components/form/FormSubtitle";
import FormGroup from "@/components/form/FormGroup";
import FormInput from "@/components/form/FormInput";
import FormSubmit from "@/components/form/FormSubmit";
import { useToast } from "@/components/Toast";

const signupSchema = z.object({
	login: z.string().min(1, { message: "Je vyžadováno přihlašovací jméno" }),
	name: z.string().min(1, { message: "Je vyžadováno jméno" }),
	password: z.string().min(6, { message: "Heslo musí mít alespoň 6 znaků" }),
});

type SignupSchema = z.infer<typeof signupSchema>;

export default function SignupPage() {
	const router = useRouter();
	const methods = useForm<SignupSchema>({
		resolver: zodResolver(signupSchema),
	});
	const {
		handleSubmit,
		formState: { isSubmitting },
	} = methods;

	const { showError } = useToast();

	const onFormSubmit = async (data: SignupSchema) => {
		const response = await fetch("/api/manager/signup", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ ...data, is_manager: true }),
		});

		if (response.ok) {
			const result = await signIn("credentials", {
				login: data.login,
				password: data.password,
				redirect: false,
				callbackUrl: "/",
			});

			if (result?.ok) {
				window.location.href = "/";
			} else {
				router.push("/login");
			}
		} else {
			const errorData = await response.json();
			showError(errorData.error || "Registrace se nezdařila");
		}
	};

	return (
		<FormProvider {...methods}>
			<FormContainer onSubmit={handleSubmit(onFormSubmit)}>
				<FormTitle>Vytvořit manažerský účet</FormTitle>
				<FormSubtitle>
					Připojte se k nám! Pro začátek prosím vyplňte své údaje.
				</FormSubtitle>
				<FormGroup>
					<FormInput
						label="Přihlašovací jméno"
						id="login"
						name="login"
						type="text"
					/>
				</FormGroup>
				<FormGroup>
					<FormInput
						label="Jméno"
						id="name"
						name="name"
						type="text"
					/>
				</FormGroup>
				<FormGroup>
					<FormInput
						label="Heslo"
						id="password"
						name="password"
						type="password"
						autoComplete="new-password"
					/>
				</FormGroup>
				<FormSubmit isLoading={isSubmitting}>
					Zaregistrovat se
				</FormSubmit>
				<p className="text-sm text-center text-gray-400">
					Máte již účet?{" "}
					<Link
						href="/login"
						className="font-medium text-indigo-500 hover:text-indigo-400"
					>
						Přihlásit se
					</Link>
				</p>
			</FormContainer>
		</FormProvider>
	);
}
