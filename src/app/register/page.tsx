'use client';
import { BaseForm, FormGroup, FormSubmit, FormTitle, FormInput, FormLabel } from '@/components/Form';
import Button from 'react-bootstrap/esm/Button';

export default function Page() {

	const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const username = formData.get('username') as string;
		const password = formData.get('password') as string;

		try {
			const response = await fetch('/api/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username, password }),
			});

			if (!response.ok) {
				throw new Error('Failed to log in');
			}

			const data = await response.json();
			console.log('Login successful:', data);
			window.location.href = '/'; // Redirect to home page after successful login
		} catch (error) {
			console.error('Login error:', error);
			alert('Login failed. Please check your credentials and try again.');
		}
	}

	return (
		<div className="container flex justify-center">
			<BaseForm onSubmit={handleRegister} className='mt-10'>
				<FormTitle>Registrace ORGa</FormTitle>
				<FormGroup>
					<FormLabel htmlFor='username'>Uživatelské jméno</FormLabel>
					<FormInput name='username' type='text' id='username' placeholder='Uživatelské jméno' />
				</FormGroup>
				<FormGroup>
					<FormLabel htmlFor='password'>Heslo</FormLabel>
					<FormInput name='password' type='password' id='password' placeholder='Heslo' />
				</FormGroup>
				<FormSubmit>
					Registrovat se
				</FormSubmit>
			</BaseForm>

		</div>
	);
}
