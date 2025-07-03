'use client';

import { BaseForm, FormGroup, FormInput, FormLabel, FormSubmit, FormTitle } from '@/components/Form';
import { login } from '@/lib/account';
import { LoginResponseData } from '@/types/login';
import { useAuth } from '@/utils/auth-context';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { COOKIE_NAME, COOKIE_TOKEN } from '@/config';
import { useState } from 'react';
import { Alert } from '@/components/ui/Alert';

export default function Login() {
	const { isLoggedIn, setIsLoggedIn, isAdmin } = useAuth();
	const [error, setError] = useState("");

	const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		let loginData: LoginResponseData;
		try {
			loginData = await login(email, password)
		} catch (error: any) {
			setError(error.message || String(error));
			return;
		}
		window.location.href = '/dashboard';
		setIsLoggedIn(true);
		localStorage.setItem(COOKIE_TOKEN, loginData.token);

		localStorage.setItem(COOKIE_NAME, loginData.name);
	}

	return (
		<div className="container flex justify-center">
			{isLoggedIn ? (
				<div className='text-center mt-10'>
					{isAdmin ? (
						<div>
							<h2 className='mb-4'>Jste již přihlášeni</h2>
							<Button variant='secondary' size='sm'>
								<Link href="/dashboard" className="text-white">
									Přejít na dashboard
								</Link>
							</Button>
						</div>
					) : (
						<div>
							<h2 className='mb-4'>Jste již přihlášeni jako účastník</h2>
							<Button variant='secondary' size='sm'>
								<Link href="/" className="text-white">
									Přejít na inventář
								</Link>
							</Button>
						</div>
					)}
				</div>
			) : (
				<div>
					{error && (
						<Alert variant='danger' className='mt-10'>
							{error}
						</Alert>
					)}
					<BaseForm className='mt-10' onSubmit={handleLogin}>
						<FormTitle>Přihlášení ORGa</FormTitle>
						<FormGroup>
							<FormLabel htmlFor='email'>Email</FormLabel>
							<FormInput name='email' type='email' id='email' placeholder='Email' />
						</FormGroup>
						<FormGroup>
							<FormLabel htmlFor='password'>Heslo</FormLabel>
							<FormInput name='password' type='password' id='password' placeholder='Heslo' />
						</FormGroup>
						<FormSubmit>
							Přihlásit se 🚀
						</FormSubmit>
					</BaseForm>
				</div>
			)}
		</div>
	);
}
