"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Alert from "@/components/Alert";
import FormContainer from "@/components/form/FormContainer";
import { FormProvider } from "react-hook-form";
import FormTitle from "@/components/form/FormTitle";
import z from "zod";
import FormSubmit from "@/components/form/FormSubmit";
import FormGroup from "@/components/form/FormGroup";
import FormInput from "@/components/form/FormInput";
import FormSubtitle from "@/components/form/FormSubtitle";

const createItemSchema = z.object({
	title: z.string().min(1, { message: "Title is required" }),
	description: z.string().optional(),
	price: z.coerce
		.number()
		.int()
		.min(0, { message: "Price must be a positive number" })
		.optional(),
});

type CreateItemSchema = z.infer<typeof createItemSchema>;

export default function AddItemPage() {
	const [message, setMessage] = useState<string | null>(null);
	const [messageType, setMessageType] = useState<"success" | "danger">("success");

	const methods = useForm<CreateItemSchema>({
		resolver: zodResolver(createItemSchema),
	});

	const {
		handleSubmit,
		formState: { isSubmitting },
	} = methods;

	const onFormSubmit = async (data: CreateItemSchema) => {
		try {
			const response = await fetch("/api/marketplace/items", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (response.ok) {
				const newItem = await response.json();
				setMessage(`Item "${newItem.title}" created successfully!`);
				setMessageType("success");
				methods.reset(); // Reset the form after successful submission
			} else {
				const errorData = await response.json();
				setMessage(errorData.error || "Failed to create item");
				setMessageType("danger");
			}
		} catch (error) {
			console.error("Failed to create item:", error);
			setMessage("Failed to create item");
			setMessageType("danger");
		}
	};
	return (
		<div>
			{message && (
				<Alert variant={messageType} message={message} />
			)}

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
						/>
					</FormGroup>

					<FormSubmit isLoading={isSubmitting}>
						Add Item
					</FormSubmit>
				</FormContainer>
			</FormProvider>
		</div>
	);
}
