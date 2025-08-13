"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Button from "./Button";
import { useBalance } from "@/hooks/useBalance";

export default function Header() {
	const { data: session } = useSession();
	const { balance, isLoading } = useBalance();

	const name = session?.user?.name;

	return (
		<header className="bg-gray-800 shadow-md">
			<nav className="container mx-auto px-6 py-3 flex max-md:flex-wrap justify-between items-center">
				<Link href="/" className="text-2xl font-bold text-indigo-500">
					RoboCoin
				</Link>
				<div className="flex items-center space-x-4">
					{name ? (
						<>
							<span className="text-gray-300">{name}</span>
							<span className="text-gray-300 font-bold">
								Balance: {isLoading ? "..." : balance || 0}
							</span>
							<Button
								onClick={() => signOut()}
								variant="secondary"
								size="sm"
							>
								Logout
							</Button>
						</>
					) : (
						<>
							<Link href="/login">
								<Button variant="info">Login</Button>
							</Link>
							<Link href="/signup">
								<Button variant="primary">Sign Up</Button>
							</Link>
						</>
					)}
				</div>
			</nav>
		</header>
	);
}
