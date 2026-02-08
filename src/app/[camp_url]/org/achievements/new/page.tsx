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
import { Item } from "@/types";

const createAchievementSchema = z.object({
	title: z.string().min(1, { message: "Je vyžadován název" }),
	description: z.string().optional(),
	price: z.string().refine(
		(val) => {
			if (!val || val === "") return true;
			const num = Number(val);
			return !isNaN(num) && num >= 0 && Number.isInteger(num);
		},
		{ message: "Cena musí být kladné celé číslo" }
	),
});

type CreateAchievementSchema = z.infer<typeof createAchievementSchema>;

export default function CreateAchievementPage() {
	const methods = useForm<CreateAchievementSchema>({
		resolver: zodResolver(createAchievementSchema),
		defaultValues: {
			title: "",
			description: "",
			price: "",
		},
	});
	const {
		handleSubmit,
		formState: { isSubmitting },
	} = methods;

	const { showError, showSuccess } = useToast();

	const onFormSubmit = async (data: CreateAchievementSchema) => {
		try {
			const submitData = {
				title: data.title,
				description: data.description,
				...(data.price &&
					data.price !== "" && { price: Number(data.price) }),
			};
			const newAchievement = await fetcher<Item>("/api/items", {
				method: "POST",
				body: submitData,
			});

			showSuccess(
				`Úspěch "${newAchievement.title}" byl úspěšně vytvořen!`
			);
			methods.reset(); // Reset the form after successful submission
		} catch (error) {
			if (error instanceof FetchError) {
				showError(error.info.error || "Nepodařilo se vytvořit úspěch");
			} else {
				showError(
					"Při vytváření úspěchu došlo k neočekávané chybě."
				);
			}
			console.error("Nepodařilo se vytvořit úspěch:", error);
		}
	};

	return (
		<div>
			<FormProvider {...methods}>
				<FormContainer onSubmit={handleSubmit(onFormSubmit)}>
					<FormTitle>Vytvořit nový úspěch</FormTitle>
					<FormSubtitle>
						Vyplňte následující formulář pro vytvoření nového
						úspěchu, který mohou uživatelé získat.
					</FormSubtitle>

					<FormGroup>
						<FormInput
							label="Název"
							id="title"
							name="title"
							type="text"
							placeholder="např. Mistr kempování"
						/>
					</FormGroup>

					<FormGroup>
						<FormInput
							label="Popis"
							id="description"
							name="description"
							type="text"
							placeholder="např. Dokončete všechny kempové aktivity."
						/>
					</FormGroup>

					<FormGroup>
						<FormInput
							label="Hodnota"
							id="price"
							name="price"
							type="number"
							placeholder="0"
						/>
					</FormGroup>

					<FormSubmit isLoading={isSubmitting}>
						Vytvořit úspěch
					</FormSubmit>
				</FormContainer>
			</FormProvider>
		</div>
	);
}
