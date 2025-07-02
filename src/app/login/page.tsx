'use client';

import { BaseForm, FormGroup, FormInput, FormLabel, FormSubmit, FormTitle } from '@/components/Form';
import { login } from '@/lib/account';
import { LoginResponseData } from '@/types/login';
import { useAuth } from '@/utils/auth-context';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Login() {
	const { isLoggedIn, setIsLoggedIn, isAdmin } = useAuth();

	const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const username = formData.get('username') as string;
		const password = formData.get('password') as string;

		let loginData: LoginResponseData;
		try {
			loginData = await login(username, password)
		} catch (error) {
			alert('Přihlášení selhalo: ' + error);
			return;
		}
		window.location.href = '/dashboard';
		setIsLoggedIn(true);
		localStorage.setItem('ID', loginData.id);
		localStorage.setItem('name', loginData.name);
	}

	return (
		<div className="container flex justify-center">
			{isLoggedIn ? (
				<div className='text-center mt-10'>
					{isAdmin ? (
						<div>
							<h2 className='mb-4'>Jste již přihlášeni</h2>
							<Button variant='secondary'>
								<Link href="/dashboard" className="text-white">
									Přejít na dashboard
								</Link>
							</Button>
						</div>
					) : (
						<div>
							<h2 className='mb-4'>Jste již přihlášeni jako účastník</h2>
							<Button variant='secondary'>
								<Link href="/" className="text-white">
									Přejít na inventář
								</Link>
							</Button>
						</div>
					)}
				</div>
			) : (
				<BaseForm className='mt-10' onSubmit={handleLogin}>
					<FormTitle>Přihlášení ORGa</FormTitle>
					<FormGroup>
						<FormLabel htmlFor='username'>Uživatelské jméno</FormLabel>
						<FormInput name='username' type='text' id='username' placeholder='Uživatelské jméno' />
					</FormGroup>
					<FormGroup>
						<FormLabel htmlFor='password'>Heslo</FormLabel>
						<FormInput name='password' type='password' id='password' placeholder='Heslo' />
					</FormGroup>
					<FormSubmit>
						Přihlásit se 🚀
					</FormSubmit>
				</BaseForm>
			)}
		</div>
	);
}
