"use client";

import { useRouter } from "next/navigation";
import { z } from "zod";
import FormContainer from "@/components/form/FormContainer";
import FormTitle from "@/components/form/FormTitle";
import FormSubtitle from "@/components/form/FormSubtitle";
import FormGroup from "@/components/form/FormGroup";
import FormInput from "@/components/form/FormInput";
import FormSubmit from "@/components/form/FormSubmit";

// Zod schema for the form validation
const createAchievementSchema = z.object({
	title: z.string().min(1, { message: "Title is required" }),
	description: z.string().optional(),
	price: z.coerce
		.number()
		.int()
		.min(0, { message: "Price must be a positive number" })
		.optional(),
});

type CreateAchievementSchema = z.infer<typeof createAchievementSchema>;

export default function CreateAchievementPage() {
	const [message, setMessage] = useState<string | null>(null);

	const handleSubmit = async (data: CreateAchievementSchema) => {
		try {
			const response = await fetch("/api/items", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (response.ok) {
				// Redirect to the achievements management page on success
				setMessage("Achievement created successfully!");
			} else {
				const errorData = await response.json();
				console.error("Failed to create achievement:", errorData.error);
				// Here you could set an error state to display to the user
			}
		} catch (error) {
			console.error("An unexpected error occurred:", error);
		}
	};

	return (

		<FormContainer<CreateAchievementSchema>
			onSubmit={handleSubmit}
			schema={createAchievementSchema}
		>
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

			<FormSubmit>Create Achievement</FormSubmit>
		</FormContainer>
	);
}
