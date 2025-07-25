"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FormContainer from "@/components/form/FormContainer";
import FormTitle from "@/components/form/FormTitle";
import FormSubtitle from "@/components/form/FormSubtitle";
import FormGroup from "@/components/form/FormGroup";
import FormInput from "@/components/form/FormInput";
import FormSubmit from "@/components/form/FormSubmit";

export default function LoginPage() {
	const [login, setLogin] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);
		const result = await signIn("credentials", {
			login,
			password,
			redirect: false,
		});

		if (result?.error) {
			setError("Invalid login or password");
		} else {
			router.push("/");
		}
	};

	return (
		<FormContainer onSubmit={handleSubmit}>
			<FormTitle>Login</FormTitle>
			<FormSubtitle>Welcome back! Please enter your details.</FormSubtitle>
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
					required
					value={login}
					onChange={(e) => setLogin(e.target.value)}
				/>
			</FormGroup>
			<FormGroup>
				<FormInput
					label="Password"
					id="password"
					name="password"
					type="password"
					autoComplete="current-password"
					required
					value={password}
					onChange={(e) => setPassword(e.target.value)}
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
