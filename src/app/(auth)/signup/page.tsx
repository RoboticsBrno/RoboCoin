"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { signIn } from "next-auth/react";
import FormContainer from "@/components/form/FormContainer";
import FormTitle from "@/components/form/FormTitle";
import FormSubtitle from "@/components/form/FormSubtitle";
import FormGroup from "@/components/form/FormGroup";
import FormInput from "@/components/form/FormInput";
import FormSubmit from "@/components/form/FormSubmit";
import { useState } from "react";

const signupSchema = z.object({
    login: z.string().min(1, { message: "Login is required" }),
    name: z.string().min(1, { message: "Name is required" }),
    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters" }),
});

type SignupSchema = z.infer<typeof signupSchema>;

export default function SignupPage() {
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (data: SignupSchema) => {
        const response = await fetch("/api/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            // Automatically sign in the user after successful signup
            const result = await signIn("credentials", {
                login: data.login,
                password: data.password,
                redirect: false,
                callbackUrl: "/",
            });

            if (result?.ok) {
                router.push(result.url || "/");
            } else {
                // Handle sign-in error, e.g., redirect to login with an error message
                router.push("/login?error=signin_failed");
            }
        } else {
            const errorData = await response.text();
            if (errorData) {
                setError(errorData);
            } else {
                setError(
                    "An unexpected error occurred. Please try again later."
                );
            }
        }
    };

    return (
        <FormContainer<SignupSchema>
            onSubmit={handleSubmit}
            schema={signupSchema}
        >
            <FormTitle>Create an account</FormTitle>
            <FormSubtitle>
                Join us! Please fill in your details to get started.
            </FormSubtitle>
            {error && (
                <p className="text-sm text-center text-red-500">{error}</p>
            )}
            <FormGroup>
                <FormInput label="Login" id="login" name="login" type="text" />
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
            <FormSubmit>Sign up</FormSubmit>
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
    );
}
