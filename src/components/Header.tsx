"use client";

import { logout } from "@/lib/account";
import { useAuth } from "@/utils/auth-context";
import Link from "next/link";
import Button from 'react-bootstrap/Button';
import { useEffect, useState } from "react";

export function Header() {
	const { isLoggedIn, setIsLoggedIn, isAdmin } = useAuth();
	const [name, setName] = useState("Guest");

	const handleLogout = async () => {
		await logout();
		setIsLoggedIn(false);
		localStorage.removeItem("ID");
		localStorage.removeItem("name");
		localStorage.removeItem("userID");
		localStorage.removeItem("userName");
		window.location.href = "/";
	};

	useEffect(() => {
		const storedName = localStorage.getItem("name") || localStorage.getItem("userName");
		setName(storedName);
	}, [isLoggedIn]);

	return (
		<header className="bg-orange-500">
			<div className={`pt-3 pb-1 container flex items-center justify-between max-sm:flex-col ${isLoggedIn ? 'pb-3' : null}`}>
				<Link href={isAdmin ? '/dashboard' : '/'}><h1 className="text-white">RoboCoin</h1></Link>
				<nav className="text-white flex items-center">
					{isLoggedIn ? (
						<div className="flex items-center">
							<Button variant="secondary" onClick={handleLogout}>Odhlásit</Button>
							<div className="ml-4">
								{name}
							</div>
						</div>
					) : (
						<div className="flex items-center max-md:flex-wrap justify-center mb-1">
							<div className="mr-4 mb-2 min-md:bg-orange-400 rounded-md max-md:p-0 min-md:px-4 min-md:py-3 flex flex-col items-center">
								<div className="mb-2 max-md:hidden">ÚČASTNÍK</div>
								<Button variant="success"><Link href="/" className="hover:underline user-after">Přihlásit</Link></Button>
							</div>
							<div className="flex flex-col mb-2 items-center justify-center rounded-md min-md:bg-orange-700 max-md:p-0 min-md:px-4 min-md:py-3">
								<div className="mb-2 max-md:hidden">ORG</div>
								<div className="flex items-center">
									<Button variant="success" className="mr-4"><Link href="/login" className="hover:underline org-after">Příhlásit</Link></Button>
									<Button variant="info"><Link href="/register" className="hover:underline org-after">Registrovat</Link></Button>
								</div>
							</div>
						</div>
					)}
				</nav>
			</div>
		</header >
	)
}
