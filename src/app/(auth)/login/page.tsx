"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
	const [login, setLogin] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
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
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
				<div className="text-center">
					<h1 className="text-3xl font-bold text-gray-900">Login</h1>
					<p className="mt-2 text-sm text-gray-600">
						Welcome back! Please enter your details.
					</p>
				</div>
				<form className="space-y-6" onSubmit={handleSubmit}>
					{error && (
						<p className="text-sm text-center text-red-500">{error}</p>
					)}
					<div>
						<label
							htmlFor="login"
							className="block text-sm font-medium text-gray-700"
						>
							Login
						</label>
						<input
							id="login"
							name="login"
							type="text"
							autoComplete="login"
							required
							className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
							value={login}
							onChange={(e) => setLogin(e.target.value)}
						/>
					    </div>
					<div>
						<label
							htmlFor="password"
							className="block text-sm font-medium text-gray-700"
						>
							Password
						</label>
						<input
							id="password"
							name="password"
							type="password"
							autoComplete="current-password"
							required
							className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>
					<div>
						<button
							type="submit"
							className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
						>
							Login
						</button>
					</div>
				</form>
				<p className="text-sm text-center text-gray-600">
					Don&apos;t have an account?{" "}
					<Link
						href="/signup"
						className="font-medium text-indigo-600 hover:text-indigo-500"
					>
						Sign up
					</Link>
				</p>
			</div>
		</div>
	);
}
