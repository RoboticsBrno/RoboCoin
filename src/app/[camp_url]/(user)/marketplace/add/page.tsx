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
import FormFileInput from "@/components/form/FormFileInput";

const createItemSchema = z.object({
	title: z.string().min(1, { message: "Title is required" }),
	description: z.string().optional(),
	file: z.file().optional(),
	price: z
		.string()
		.min(1, { message: "Price is required" })
		.refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
			message: "Price must be a positive number",
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
				showSuccess(`Item "${newItem.title}" created successfully!`);
				methods.reset(); // Reset the form after successful submission
			} else {
				const errorData = await response.json();
				showError("Failed to create item");
				console.error("Failed to create item:", errorData);
			}
		} catch (error) {
			console.error("Failed to create item:", error);
			showError("An unexpected error occurred while creating the item.");
		}
	};
	return (
		<div>
			<FormProvider {...methods}>
				<FormContainer onSubmit={handleSubmit(onFormSubmit)}>
					<FormTitle>Add Item</FormTitle>
					<FormSubtitle>
						Fill out the form below to add a new item.
					</FormSubtitle>

					<FormGroup>
						<FormInput
							name="title"
							label="Title"
							placeholder="Enter item title"
							required
						/>
					</FormGroup>

					<FormGroup>
						<FormInput
							name="description"
							label="Description"
							placeholder="Enter item description"
							type="textarea"
						/>
					</FormGroup>

					<FormGroup>
						<FormInput
							name="price"
							label="Price"
							placeholder="Enter item price"
							type="number"
							min={0}
							required
						/>
					</FormGroup>

					<FormGroup>
						<FormFileInput
							name="file"
							label="File URL"
							placeholder="Enter file URL (optional)"
						/>
					</FormGroup>

					<FormSubmit isLoading={isSubmitting}>Add Item</FormSubmit>
				</FormContainer>
			</FormProvider>
		</div>
	);
}
