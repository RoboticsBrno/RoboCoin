"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormContainer from "@/components/form/FormContainer";
import { FormProvider } from "react-hook-form";
import FormTitle from "@/components/form/FormTitle";
import z from "zod";
import FormSubmit from "@/components/form/FormSubmit";
import FormGroup from "@/components/form/FormGroup";
import FormInput from "@/components/form/FormInput";
import FormSubtitle from "@/components/form/FormSubtitle";
import { useToast } from "@/components/Toast";

const createItemSchema = z.object({
	title: z.string().min(1, { message: "Je vyžadován název" }),

	description: z.string().optional(),

	file: z.any().optional(),

	price: z

		.string()

		.min(1, { message: "Je vyžadována cena" })

		.refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
			message: "Cena musí být kladné číslo",
		}),
});

type CreateItemSchema = z.infer<typeof createItemSchema>;

export default function AddItemPage() {
	const methods = useForm<CreateItemSchema>({
		resolver: zodResolver(createItemSchema),
	});

	const {
		handleSubmit,

		formState: { isSubmitting },
	} = methods;

	const { showError, showSuccess } = useToast();

	const onFormSubmit = async (data: CreateItemSchema) => {
		try {
			const submitData = {
				...data,

				price: Number(data.price),
			};

			const response = await fetch("/api/marketplace/items", {
				method: "POST",

				headers: {
					"Content-Type": "application/json",
				},

				body: JSON.stringify(submitData),
			});

			if (response.ok) {
				const newItem = await response.json();

				showSuccess(`Předmět "${newItem.title}" byl úspěšně vytvořen!`);

				methods.reset(); // Reset the form after successful submission
			} else {
				const errorData = await response.json();

				showError("Nepodařilo se vytvořit předmět");

				console.error("Failed to create item:", errorData);
			}
		} catch (error) {
			console.error("Failed to create item:", error);

			showError("Při vytváření předmětu došlo k neočekávané chybě.");
		}
	};

	return (
		<div>
			<FormProvider {...methods}>
				<FormContainer onSubmit={handleSubmit(onFormSubmit)}>
					<FormTitle>Přidat předmět</FormTitle>

					<FormSubtitle>
						Vyplňte níže uvedený formulář pro přidání nového
						předmětu.
					</FormSubtitle>

					<FormGroup>
						<FormInput
							name="title"
							label="Název"
							placeholder="Zadejte název předmětu"
							required
						/>
					</FormGroup>

					<FormGroup>
						<FormInput
							name="description"
							label="Popis"
							placeholder="Zadejte popis předmětu"
							type="textarea"
						/>
					</FormGroup>

					<FormGroup>
						<FormInput
							name="price"
							label="Cena"
							placeholder="Zadejte cenu předmětu"
							type="number"
							min={0}
							required
						/>
					</FormGroup>

					<FormSubmit isLoading={isSubmitting}>
						Přidat předmět
					</FormSubmit>
				</FormContainer>
			</FormProvider>
		</div>
	);
}
