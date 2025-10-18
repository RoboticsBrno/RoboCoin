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
import FormCheckbox from "@/components/form/FormCheckbox";
import { useToast } from "@/components/Toast";
import { fetcher, FetchError } from "@/lib/fetch";
import { SignupResponse } from "@/types";

const createUserSchema = z.object({
	login: z.string().min(1, { message: "Login is required" }),
	name: z.string().min(1, { message: "Name is required" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters" }),
	isOrg: z.boolean(),
	isAdmin: z.boolean(),
});

type CreateAchievementSchema = z.infer<typeof createUserSchema>;

export default function CreateUserPage() {
	const methods = useForm<CreateAchievementSchema>({
		resolver: zodResolver(createUserSchema),
		defaultValues: {
			login: "",
			name: "",
			password: "",
			isOrg: false,
			isAdmin: false,
		},
	});
	const {
		handleSubmit,
		formState: { isSubmitting },
	} = methods;

	const { showError, showSuccess } = useToast();

	const onFormSubmit = async (data: CreateAchievementSchema) => {
		try {
			const newUser = await fetcher<SignupResponse>("/api/signup", {
				method: "POST",
				body: data,
			});

			showSuccess(`User "${newUser.user.name}" created successfully!`);
			methods.reset();
		} catch (error) {
			if (error instanceof FetchError) {
				showError(error.info.error || "Failed to create user");
			} else {
				showError("An unexpected error occurred while creating user.");
			}
		}
	};

	return (
		<div>
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
