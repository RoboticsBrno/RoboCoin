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

const createAchievementSchema = z.object({
	title: z.string().min(1, { message: "Title is required" }),
	description: z.string().optional(),
	price: z
		.string()
		.optional()
		.refine(
			(val) => {
				if (!val || val === "") return true;
				const num = Number(val);
				return !isNaN(num) && num >= 0 && Number.isInteger(num);
			},
			{ message: "Price must be a positive number" }
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
			const response = await fetch("/api/items", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(submitData),
			});

			if (response.ok) {
				const newAchievement = await response.json();
				showSuccess(`Achievement "${newAchievement.title}" created successfully!`);
				methods.reset(); // Reset the form after successful submission
			} else {
				const errorData = await response.json();
				showError("Failed to create achievement");
				console.error("Failed to create achievement:", errorData);
			}
		} catch (error) {
			showError("An unexpected error occurred while creating the achievement.");
		}
	};

	return (
		<div>
			<FormProvider {...methods}>
				<FormContainer onSubmit={handleSubmit(onFormSubmit)}>
					<FormTitle>Create New Achievement</FormTitle>
					<FormSubtitle>
						Fill in the details for the new achievement.
					</FormSubtitle>

					<FormGroup>
						<FormInput
							label="Title"
							id="title"
							name="title"
							type="text"
							placeholder="e.g., 'First Place in Hackathon'"
						/>
					</FormGroup>

					<FormGroup>
						<FormInput
							label="Description"
							id="description"
							name="description"
							type="text"
							placeholder="A short description of the achievement."
						/>
					</FormGroup>

					<FormGroup>
						<FormInput
							label="Price (optional)"
							id="price"
							name="price"
							type="number"
							placeholder="0"
						/>
					</FormGroup>

					<FormSubmit isLoading={isSubmitting}>
						Create Achievement
					</FormSubmit>
				</FormContainer>
			</FormProvider>
		</div>
	);
}
