"use client";

import { loginUser } from "@/lib/account";
import Button from "@/components/ui/Button";
import { useAuth } from "@/utils/auth-context";
import { LoginResponseData } from "@/types/login";
import { BaseForm, FormGroup, FormInput, FormLabel, FormSubmit, FormTitle } from "@/components/Form";
import Link from "next/link";
import Inventory from "@/components/Inventory";
import { COOKIE_USER_NAME, COOKIE_USER_TOKEN } from "@/config";

export default function Home() {
	const { isLoggedIn, setIsLoggedIn, isAdmin } = useAuth();

	const handleLoginUser = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const username = formData.get('username') as string;

		let loginData: LoginResponseData;
		try {
			loginData = await loginUser(username)
		} catch (error: any) {
			alert('Přihlášení selhalo: ' + error);
			return;
		}
		console.log('Login successful:', loginData);
		setIsLoggedIn(true);
		localStorage.setItem(COOKIE_USER_TOKEN, loginData.token);
		localStorage.setItem(COOKIE_USER_NAME, loginData.name);

	}

	return (
		<div className="flex justify-center">
			{isLoggedIn && !isAdmin ? (
				<Inventory />
			) : !isAdmin ? (
				<div className="container">
					<BaseForm className="mt-10" onSubmit={handleLoginUser}>
						<FormTitle>Přihlášení účastníka</FormTitle>

						<FormGroup>
							<FormLabel htmlFor='username'>Uživatelské jméno</FormLabel>
							<FormInput name='username' type='text' id='username' placeholder='Uživatelské jméno' />
						</FormGroup>
						<FormSubmit>
							Přihlásit se 🚀
						</FormSubmit>
					</BaseForm>
				</div>
			) : (
				<div className='text-center mt-10'>
					<h2 className='mb-4'>Jste již přihlášeni jako administrátor</h2>
					<Button variant='secondary' size="sm">
						<Link href="/dashboard" className="text-white">
							Přejít na dashboard
						</Link>
					</Button>
				</div>
			)}
		</div>
	);
}
