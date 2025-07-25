"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import FormContainer from "@/components/form/FormContainer";
import FormTitle from "@/components/form/FormTitle";
import FormSubtitle from "@/components/form/FormSubtitle";
import FormGroup from "@/components/form/FormGroup";
import FormInput from "@/components/form/FormInput";
import FormSubmit from "@/components/form/FormSubmit";

export default function SignupPage() {
	const [login, setLogin] = useState("");
	const [name, setName] = useState("");
	const [password, setPassword] = useState("");
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		await fetch("/api/signup", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ login, name, password }),
		});

		router.push("/login");
	};

	return (
		<FormContainer onSubmit={handleSubmit}>
			<FormTitle>Create an account</FormTitle>
			<FormSubtitle>Join us! Please fill in your details to get started.</FormSubtitle>
			<FormGroup>
				<FormInput
					label="Login"
					id="login"
					name="login"
					type="text"
					required
					value={login}
					onChange={(e) => setLogin(e.target.value)}
				/>
			</FormGroup>
			<FormGroup>
				<FormInput
					label="Name"
					id="name"
					name="name"
					type="text"
					required
					value={name}
					onChange={(e) => setName(e.target.value)}
				/>
			</FormGroup>
			<FormGroup>
				<FormInput
					label="Password"
					id="password"
					name="password"
					type="password"
					autoComplete="new-password"
					required
					value={password}
					onChange={(e) => setPassword(e.target.value)}
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
