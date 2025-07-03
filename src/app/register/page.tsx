'use client';
import { BaseForm, FormGroup, FormTitle, FormInput, FormLabel, FormSubmit } from '@/components/Form';
import { BACKEND_URL } from '@/config';
import { RegisterBody } from '@/types/api';

export default function Page() {

	const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		try {
			const body: RegisterBody = {
				email,
				password,
				role: 'NONE',
			};

			const response = await fetch(BACKEND_URL + '/admin/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			});

			if (!response.ok) {
				console.error('Register failed:', response.statusText);
				throw new Error('Register failed');
			}

			window.location.href = '/login'; // Redirect to home page after successful login
		} catch (error: any) {
			console.error('Register error:', error);
		}
	}

	return (
		<div className="container flex justify-center">
			<BaseForm onSubmit={handleRegister} className='mt-10'>
				<FormTitle>Registrace ORGa</FormTitle>
				<FormGroup>
					<FormLabel htmlFor='email'>Email</FormLabel>
					<FormInput name='email' type='email' id='email' placeholder='Email' />
				</FormGroup>
				<FormGroup>
					<FormLabel htmlFor='password'>Heslo</FormLabel>
					<FormInput name='password' type='password' id='password' placeholder='Heslo' />
				</FormGroup>
				<FormSubmit>
					Registrovat se 🚀
				</FormSubmit>
			</BaseForm>

		</div>
	);
}
