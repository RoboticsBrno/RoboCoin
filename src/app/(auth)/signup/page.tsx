"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { signIn } from "next-auth/react";
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
	login: z.string().min(1, { message: "Login is required" }),
	name: z.string().min(1, { message: "Name is required" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters" }),
});

type SignupSchema = z.infer<typeof signupSchema>;

export default function SignupPage() {
	const router = useRouter();
	const methods = useForm<SignupSchema>({
		resolver: zodResolver(signupSchema),
	});
	const {
		handleSubmit,
		formState: { isSubmitting },
	} = methods;

	const { showError } = useToast();

	const onFormSubmit = async (data: SignupSchema) => {
		const response = await fetch("/api/manager/signup", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ ...data, is_manager: true }),
		});

		if (response.ok) {
			const result = await signIn("credentials", {
				login: data.login,
				password: data.password,
				redirect: false,
				callbackUrl: "/",
			});

			if (result?.ok) {
				window.location.href = "/";
			} else {
				router.push("/login");
			}
		} else {
			const errorData = await response.json();
			showError(errorData.error || "Signup failed");
		}
	};

	return (
		<FormProvider {...methods}>
			<FormContainer onSubmit={handleSubmit(onFormSubmit)}>
				<FormTitle>Create a manager account</FormTitle>
				<FormSubtitle>
					Join us! Please fill in your details to get started.
				</FormSubtitle>
				<FormGroup>
					<FormInput
						label="Login"
						id="login"
						name="login"
						type="text"
					/>
				</FormGroup>
				<FormGroup>
					<FormInput label="Name" id="name" name="name" type="text" />
				</FormGroup>
				<FormGroup>
					<FormInput
						label="Password"
						id="password"
						name="password"
						type="password"
						autoComplete="new-password"
					/>
				</FormGroup>
				<FormSubmit isLoading={isSubmitting}>Sign up</FormSubmit>
				<p className="text-sm text-center text-gray-400">
					Already have an account?{" "}
					<Link
						href="/login"
						className="font-medium text-indigo-500 hover:text-indigo-400"
					>
						Login
					</Link>
				</p>
			</FormContainer>
		</FormProvider>
	);
}
