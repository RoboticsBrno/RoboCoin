import { useUserRole } from '@/hooks/useUserRole';
import Link from 'next/link';
import React from 'react';

interface CardProps {
	href: string;
	title: string;
	description: string;
	type?: 'org' | 'admin';
}

export default function Card({ href, title, description, type }: CardProps) {
	const { is_org, is_admin } = useUserRole();

	if (type === 'org' && !is_org) return null;
	if (type === 'admin' && !is_admin) return null;

	let className = '';
	let descriptionClass = 'text-gray-400';
	if (type === 'org') {
		className = 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-700';
		descriptionClass = 'text-gray-300';
	} else if (type === 'admin') {
		className = 'bg-red-600 hover:bg-red-700 text-white border border-red-700';
		descriptionClass = 'text-gray-200';
	} else {
		className = 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700';

	}

	return (
		<Link href={href} className={`block p-6 max-w-sm rounded-sm transition-colors duration-200 ${className}`}
		>
			<h5 className="mb-2 text-2xl font-bold tracking-tight text-white">{title}</h5>
			<p className={`font-normal ${descriptionClass}`}>{description}</p>
		</Link>
	);
}
