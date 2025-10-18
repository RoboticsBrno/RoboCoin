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
import { useCamp } from "@/hooks/useCamp";
import { useEffect } from "react";
import Loader from "@/components/Loader";
import { useToast } from "@/components/Toast";

const editCampSchema = z.object({
	name: z.string().min(1, { message: "Name is required" }),
	name_url: z.string().min(1, { message: "Valid URL is required" }),
	description: z.string(),
	currency: z.string().max(3, { message: "Currency code max length is 3" }),
});

type EditCampSchema = z.infer<typeof editCampSchema>;

export default function EditCampPage({
	params,
}: {
	params: Promise<{ camp_url: string }>;
}) {
	const { camp, isLoading } = useCamp();
	const methods = useForm<EditCampSchema>({
		resolver: zodResolver(editCampSchema),
	});
	const {
		handleSubmit,
		formState: { isSubmitting },
		reset,
	} = methods;

	useEffect(() => {
		if (camp) {
			reset({
				...camp,
				description: camp.description ?? "",
				currency: camp.currency ?? "",
			});
		}
	}, [camp, reset]);

	const { showError, showSuccess } = useToast();

	const onFormSubmit = async (data: EditCampSchema) => {
		const paramsResolved = await params;
		const response = await fetch(`/api/camps/${paramsResolved.camp_url}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});

		if (response.ok) {
			showSuccess("Camp edited successfully!");
		} else {
			console.error("Failed to edit camp:", response.statusText);
			showError("Failed to edit camp. Please try again.");
		}
	};

	if (isLoading) {
		return <Loader />;
	}

	return (
		<FormProvider {...methods}>
			<FormContainer onSubmit={handleSubmit(onFormSubmit)}>
				<FormTitle>Edit a camp</FormTitle>
				<FormSubtitle>
					Please fill in the details to edit your camp.
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
				<FormSubmit isLoading={isSubmitting}>Edit camp</FormSubmit>
			</FormContainer>
		</FormProvider>
	);
}
