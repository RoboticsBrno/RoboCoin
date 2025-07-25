"use client";

import { useUserRole } from "@/hooks/useUserRole";
import Link from "next/link";

export default function Home() {
	const { is_org, is_admin } = useUserRole();

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
			<Link
				href="/login"
				className="px-6 py-3 text-lg font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
			>
				Login
			</Link>
			<Link
				href="/signup"
				className="px-6 py-3 text-lg font-medium text-indigo-600 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
			>
				Sign up
			</Link>
			{is_org && (
				<Link
					href="/org"
					className="px-6 py-3 mt-4 text-lg font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
				>
					Organization Dashboard
				</Link>
			)}
			{is_admin && (
				<Link
					href="/admin"
					className="px-6 py-3 mt-4 text-lg font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
				>
					Admin Dashboard
				</Link>
			)}
		</div >
	);
}
