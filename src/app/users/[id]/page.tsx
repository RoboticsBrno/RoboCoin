"use client";

import { BackBtn } from '@/components/BackBtn';
import { users } from '@/mock/users';
import Link from 'next/link';
import Alert from 'react-bootstrap/Alert';
import { use } from 'react';
import Button from '@/components/ui/Button';
import React from 'react';
import { DragDrop2ColForUser } from '@/components/DragDrop2Col';
import { AlertTriangle, Home, Users, Star, Coins } from 'lucide-react';

function UserNotFound({ id }: { id: string }) {
	return (
		<div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 p-6">
			<div className="container mx-auto max-w-4xl">
				<div className="text-center py-20">
					<div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/20">
						<div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 rounded-3xl"></div>
						<div className="relative">
							<div className="mb-8">
								<div className="w-24 h-24 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
									<AlertTriangle className="text-white text-4xl animate-pulse" />
								</div>
								<Alert variant="danger" className="text-center text-xl max-w-md mx-auto">
									Uživatel s ID {id} nebyl nalezen.
								</Alert>
							</div>

							<Button variant="secondary" size="lg" className="group">
								<Link href="/dashboard" className="flex items-center gap-2">
									<Home className="text-xl group-hover:-translate-x-1 transition-transform duration-300" />
									Zpět na přehled
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);

}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);

	const user = users.find(user => user.id === id);
	if (!user) {
		return (
			<UserNotFound id={id} />
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
			<div className="container mx-auto max-w-6xl">
				<BackBtn />

				<div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 mb-8">
					<div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl"></div>
					<div className="relative">
						<div className="flex items-center gap-6">
							<div className="relative max-md:hidden">
								<div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-xl">
									{user.name.charAt(0)}
								</div>
								<div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2 shadow-lg animate-bounce">
									<Star className="text-white text-sm" />
								</div>
							</div>
							<div className="flex-1">
								<h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center gap-3">
									{user.name}
									<Users className="text-blue-500" />
								</h1>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200 inline-block">
										<h3 className="font-semibold text-gray-700 mb-1">Pořadí</h3>
										<p className="text-gray-700 text-xl">2.</p>
									</div>
									<div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
										<h3 className="font-semibold text-gray-700 mb-2">Skóre</h3>
										<div className="flex items-center gap-2 text-2xl font-bold text-yellow-600">
											<Coins className="text-yellow-500" />
											420 bodů
										</div>
									</div>
								</div>

							</div>
						</div>
					</div>
				</div>

				<DragDrop2ColForUser user={user} />
			</div>
		</div>
	);
}
