"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
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

    const handleSubmit = async (data: LoginSchema) => {
        setError(null);
        try {
            const result = await signIn("credentials", {
                ...data,
                redirect: false,
                callbackUrl: "/",
            });

            if (result?.error) {
                if (result.error === "User not found") {
                    setError(
                        "User not found. Please check your login and try again."
                    );
                } else if (result.error === "Invalid password") {
                    setError("Invalid password. Please try again.");
                } else {
                    setError(
                        "An unknown error occurred. Please try again later."
                    );
                }
            } else {
                router.push("/");
            }
        } catch (error) {
            setError("An unexpected error occurred. Please try again later.");
        }
    };

    return (
        <FormContainer<LoginSchema>
            onSubmit={handleSubmit}
            schema={loginSchema}
        >
            <FormTitle>Login</FormTitle>
            <FormSubtitle>
                Welcome back! Please enter your details.
            </FormSubtitle>
            {error && (
                <p className="text-sm text-center text-red-500">{error}</p>
            )}
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
            <FormSubmit>Login</FormSubmit>
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
    );
}
