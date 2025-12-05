"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
import { fetcher, FetchError } from "@/lib/fetch";
import { SignupResponse } from "@/types";

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
	const { showError } = useToast();
	const {
		handleSubmit,
		formState: { isSubmitting },
	} = methods;

	const params = useParams();

	const onFormSubmit = async (data: SignupSchema) => {
		try {
			await fetcher<SignupResponse>("/api/signup", {
				method: "POST",
				body: { ...data, camp_url: params.camp_url as string },
			});

			const result = await signIn("credentials", {
				login: data.login,
				password: data.password,
				camp: params.camp_url as string,
				redirect: false,
				callbackUrl: "/" + params.camp_url,
			});

			if (result?.ok) {
				window.location.href = `/${params.camp_url}`;
			} else {
				router.push(`/${params.camp_url}/login`);
			}
		} catch (error) {
			if (error instanceof FetchError) {
				showError(error.info.error || "Registrace se nezdařila");
			} else {
				console.error("Signup failed", error);
				showError("Registrace se nezdařila");
			}
		}
	};

	return (
		<FormProvider {...methods}>
			<FormContainer onSubmit={handleSubmit(onFormSubmit)}>
				<FormTitle>Vytvořit účet</FormTitle>
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
						href={`/${params.camp_url}/login`}
						className="font-medium text-indigo-500 hover:text-indigo-400"
					>
						Přihlásit se
					</Link>
				</p>
			</FormContainer>
		</FormProvider>
	);
}
