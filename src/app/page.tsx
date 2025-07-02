"use client";

import { loginUser } from "@/lib/account";
import Button from "react-bootstrap/esm/Button";
import { useAuth } from "@/utils/auth-context";
import { LoginResponseData } from "@/types/login";
import { BaseForm, FormGroup, FormInput, FormLabel, FormSubmit, FormTitle } from "@/components/Form";
import Link from "next/link";
import Inventory from "@/components/Inventory";

export default function Home() {
	const { isLoggedIn, setIsLoggedIn, isAdmin } = useAuth();

	const handleLoginUser = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const username = formData.get('username') as string;
		const password = formData.get('password') as string;

		let loginData: LoginResponseData;
		try {
			loginData = await loginUser(username, password)
		} catch (error) {
			alert('Přihlášení selhalo: ' + error);
			return;
		}
		console.log('Login successful:', loginData);
		setIsLoggedIn(true);
		localStorage.setItem('userID', loginData.id);
		localStorage.setItem('userName', loginData.name);

	}

	return (
		<div className="container flex justify-center">
			{isLoggedIn && !isAdmin ? (
				<div className='mt-10'>
					<Inventory />
				</div>
			) : !isAdmin ? (
				<BaseForm className="mt-10" onSubmit={handleLoginUser}>
					<FormTitle>Přihlášení účastníka</FormTitle>

					<FormGroup>
						<FormLabel htmlFor='username'>Uživatelské jméno</FormLabel>
						<FormInput name='username' type='text' id='username' placeholder='Uživatelské jméno' />
					</FormGroup>
					<FormGroup>
						<FormLabel htmlFor='password'>ID</FormLabel>
						<FormInput name='password' type='password' id='password' placeholder='Přidělené ID' />
					</FormGroup>
					<FormSubmit>
						Přihlásit se
					</FormSubmit>
				</BaseForm>
			) : (
				<div className='text-center mt-10'>
					<h2 className='mb-4'>Jste již přihlášeni jako administrátor</h2>
					<Button variant='secondary'>
						<Link href="/dashboard" className="text-white">
							Přejít na dashboard
						</Link>
					</Button>
				</div>
			)}
		</div>
	);
}
