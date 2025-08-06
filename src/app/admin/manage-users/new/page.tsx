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
import Alert from "@/components/Alert";
import { useState } from "react";
import FormCheckbox from "@/components/form/FormCheckbox";

const createUserSchema = z.object({
	login: z.string().min(1, { message: "Login is required" }),
	name: z.string().min(1, { message: "Name is required" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters" }),
	isOrg: z.boolean().default(false),
	isAdmin: z.boolean().default(false),
});

type CreateAchievementSchema = z.infer<typeof createUserSchema>;

export default function CreateUserPage() {
	const [message, setMessage] = useState<string | null>(null);
	const [messageType, setMessageType] = useState<"success" | "danger">(
		"success"
	);

	const methods = useForm<CreateAchievementSchema>({
		resolver: zodResolver(createUserSchema),
	});
	const {
		handleSubmit,
		formState: { isSubmitting },
	} = methods;

	const onFormSubmit = async (data: CreateAchievementSchema) => {
		try {
			const response = await fetch("/api/signup", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (response.ok) {
				const newUser = await response.json();
				setMessage(`User "${newUser.name}" created successfully!`);
				setMessageType("success");
				methods.reset(); // Reset the form after successful submission
			} else {
				const errorData = await response.json();
				setMessage(errorData.error || "Failed to create user");
				setMessageType("danger");
			}
		} catch (error: any) {
			setMessage("An unexpected error occurred while creating user.");
			setMessageType("danger");
		}
	};

	return (
		<div>
			{message && <Alert variant={messageType} message={message} />}
			<FormProvider {...methods}>
				<FormContainer onSubmit={handleSubmit(onFormSubmit)}>
					<FormTitle>Create New User</FormTitle>
					<FormSubtitle>
						Fill in the details for the new user.
					</FormSubtitle>

					<FormGroup>
						<FormInput
							label="Login"
							id="login"
							name="login"
							type="text"
							placeholder="e.g., 'jirkavacha'"
						/>
					</FormGroup>

					<FormGroup>
						<FormInput
							label="Name"
							id="name"
							name="name"
							type="text"
							placeholder="e.g., 'Jirka Vacha'"
						/>
					</FormGroup>

					<FormGroup>
						<FormInput
							label="Password"
							id="password"
							name="password"
							type="password"
							autoComplete="new-password"
							placeholder="Enter a secure password"
						/>
					</FormGroup>

					<FormGroup>
						<FormCheckbox
							label="Is Org"
							id="isOrg"
							name="isOrg"
							type="checkbox"
						/>
					</FormGroup>

					<FormGroup>
						<FormCheckbox
							label="Is Admin"
							id="isAdmin"
							name="isAdmin"
							type="checkbox"
						/>
					</FormGroup>

					<FormSubmit isLoading={isSubmitting}>
						Create User
					</FormSubmit>
				</FormContainer>
			</FormProvider>
		</div>
	);
}
