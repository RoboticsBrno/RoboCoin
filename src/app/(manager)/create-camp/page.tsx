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

const signupSchema = z.object({
	name: z.string().min(1, { message: "Name is required" }),
	name_url: z.string().min(1, { message: "Valid URL is required" }),
	description: z.string(),
	currency: z.string().max(3, { message: "Currency code max length is 3" }),
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
		const response = await fetch("/api/create-camp", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});

		if (response.ok) {
			window.location.href = "/";
		} else {
			console.error("Camp creation failed");
			showError("Camp creation failed. Please try again.");
		}
	};

	return (
		<FormProvider {...methods}>
			<FormContainer onSubmit={handleSubmit(onFormSubmit)}>
				<FormTitle>Create a new camp</FormTitle>
				<FormSubtitle>
					Please fill in the details to create your camp.
				</FormSubtitle>
				<FormGroup>
					<FormInput
						label="Camp Name"
						id="name"
						name="name"
						type="text"
					/>
				</FormGroup>
				<FormGroup>
					<FormInput
						label="Camp URL"
						id="name_url"
						name="name_url"
						type="text"
					/>
				</FormGroup>
				<FormGroup>
					<FormInput
						label="Description"
						id="description"
						name="description"
						type="text"
					/>
				</FormGroup>
				<FormGroup>
					<FormInput
						label="Currency (e.g., USD)"
						id="currency"
						name="currency"
						type="text"
					/>
				</FormGroup>
				<FormSubmit isLoading={isSubmitting}>Create camp</FormSubmit>
			</FormContainer>
		</FormProvider>
	);
}
