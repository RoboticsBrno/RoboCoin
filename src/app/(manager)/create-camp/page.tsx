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
import { useToast } from "@/components/Toast";
import { fetcher, FetchError } from "@/lib/fetch";
import { CreateCampResponse } from "@/types";

const signupSchema = z.object({
	name: z.string().min(1, { message: "Je vyžadován název" }),
	name_url: z.string().min(1, { message: "Je vyžadována platná URL" }),
	description: z.string(),
	currency: z
		.string()
		.max(3, { message: "Maximální délka kódu měny jsou 3 znaky" }),
});

type SignupSchema = z.infer<typeof signupSchema>;

export default function SignupPage() {
	const methods = useForm<SignupSchema>({
		resolver: zodResolver(signupSchema),
	});
	const {
		handleSubmit,
		formState: { isSubmitting },
	} = methods;

	const { showError } = useToast();

	const onFormSubmit = async (data: SignupSchema) => {
		try {
			await fetcher<CreateCampResponse>("/api/create-camp", {
				method: "POST",
				body: data,
			});
			window.location.href = "/";
		} catch (error) {
			if (error instanceof FetchError) {
				showError(
					error.info.error ||
						"Vytvoření tábora se nezdařilo. Zkuste to prosím znovu."
				);
			} else {
				console.error("Camp creation failed", error);
				showError(
					"Vytvoření tábora se nezdařilo. Zkuste to prosím znovu."
				);
			}
		}
	};

	return (
		<FormProvider {...methods}>
			<FormContainer onSubmit={handleSubmit(onFormSubmit)}>
				<FormTitle>Vytvořit nový tábor</FormTitle>
				<FormSubtitle>
					Vyplňte prosím podrobnosti pro vytvoření tábora.
				</FormSubtitle>
				<FormGroup>
					<FormInput
						label="Název tábora"
						id="name"
						name="name"
						type="text"
					/>
				</FormGroup>
				<FormGroup>
					<FormInput
						label="URL tábora"
						id="name_url"
						name="name_url"
						type="text"
					/>
				</FormGroup>
				<FormGroup>
					<FormInput
						label="Popis"
						id="description"
						name="description"
						type="text"
					/>
				</FormGroup>
				<FormGroup>
					<FormInput
						label="Měna (např. CZK)"
						id="currency"
						name="currency"
						type="text"
					/>
				</FormGroup>
				<FormSubmit isLoading={isSubmitting}>Vytvořit tábor</FormSubmit>
			</FormContainer>
		</FormProvider>
	);
}
