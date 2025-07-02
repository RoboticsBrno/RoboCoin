"use client";

import { BackBtn } from '@/components/BackBtn';
import { users } from '@/mock/users';
import Link from 'next/link';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/esm/Button';
import { use } from 'react';
import React from 'react';
import { DragDrop2ColForUser } from '@/components/DragDrop2Col';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);

	const user = users.find(user => user.id === id);
	if (!user) {
		return (
			<div className='container mt-10'>
				<Alert variant="danger">Uživatel s ID {id} nebyl nalezen.</Alert>
				<Button variant='secondary' size='lg'>
					<Link href="/dashboard">Zpět na přehled</Link>
				</Button>
			</div>
		);
	}


	return (
		<div className="container mt-10">
			<BackBtn />
			<h1 className="text-2xl font-bold mb-2">{user.name}</h1>
			<p className="mb-2">User ID: {user.id}</p>
			<DragDrop2ColForUser user={user} />
		</div>
	);
}
