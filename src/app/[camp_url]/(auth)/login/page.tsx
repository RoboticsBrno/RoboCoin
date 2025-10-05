"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormContainer from "@/components/form/FormContainer";
import FormTitle from "@/components/form/FormTitle";
import FormSubtitle from "@/components/form/FormSubtitle";
import FormGroup from "@/components/form/FormGroup";
import FormInput from "@/components/form/FormInput";
import FormSubmit from "@/components/form/FormSubmit";

const loginSchema = z.object({
	login: z.string().min(1, { message: "Login is required" }),
	password: z.string().min(1, { message: "Password is required" }),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function LoginPage() {
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();
	const methods = useForm<LoginSchema>({
		resolver: zodResolver(loginSchema),
	});
	const {
		handleSubmit,
		formState: { isSubmitting },
	} = methods;

	const params = useParams();

	const onFormSubmit = async (data: LoginSchema) => {
		setError(null);
		try {
			const callbackUrl = params.camp_url
				? `/${params.camp_url}`
				: "/";
			const result = await signIn("credentials", {
				...data, camp: params.camp_url,
				redirect: false,
				callbackUrl
			});

			if (result?.error) {
				console.error("Login error:", result.error);
				if (result.error === "User not found") {
					setError(
						"User not found. Please check your login and try again."
					);
				} else if (result.error === "Invalid password") {
					setError("Invalid password. Please try again.");
				} else if (result.error === "User is not a manager") {
					setError("You are not authorized to log in.");
				} else {
					setError(
						"An unknown error occurred. Please try again later."
					);
				}
			} else {
				try {
					router.push(callbackUrl);
				} catch (redirectError) {
					console.error("Error during redirect:", redirectError);
					setError("Failed to redirect. Please try again later.");
				}
			}
		} catch (error) {
			console.error("Error during login:", error);
			setError("An unexpected error occurred. Please try again later.");
		}
	};

	return (
		<FormProvider {...methods}>
			<FormContainer onSubmit={handleSubmit(onFormSubmit)}>
				<FormTitle>Login to an account</FormTitle>
				<FormSubtitle>
					Welcome back! Please enter your details.
				</FormSubtitle>
				{error && (
					<p className="text-sm text-center text-red-500">{error}</p>
				)}
				<input type="hidden" name="camp" value={params.camp_url || ""} />
				<FormGroup>
					<FormInput
						label="Login"
						id="login"
						name="login"
						type="text"
						autoComplete="login"
					/>
				</FormGroup>
				<FormGroup>
					<FormInput
						label="Password"
						id="password"
						name="password"
						type="password"
						autoComplete="current-password"
					/>
				</FormGroup>
				<FormSubmit isLoading={isSubmitting}>Login</FormSubmit>
				<p className="text-sm text-center text-gray-400">
					Don&apos;t have an account?{" "}
					<Link
						href="/signup"
						className="font-medium text-indigo-500 hover:text-indigo-400"
					>
						Sign up
					</Link>
				</p>
			</FormContainer>
		</FormProvider>
	);
}
