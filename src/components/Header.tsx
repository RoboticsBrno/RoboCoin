"use client";

import { logout } from "@/lib/account";
import { useAuth } from "@/utils/auth-context";
import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { Coins, Users } from "lucide-react";
import Link from "next/link";

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
		<header className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 shadow-2xl">
			<div className="container mx-auto px-6 py-6">
				<div className="flex items-center justify-between max-sm:flex-col gap-4">
					<div className="flex items-center gap-4">
						<div className="bg-white/20 rounded-full p-3 animate-pulse">
							<Coins className="text-white text-2xl" />
						</div>
						<h1 className="text-4xl font-bold text-white tracking-wider">RoboCoin</h1>
					</div>

					<nav className="flex items-center gap-4">
						{isLoggedIn ? (
							<div className="flex items-center gap-6 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
								<Button variant="secondary" size="sm" onClick={handleLogout}>Odhlásit</Button>
								<div className="flex items-center gap-2">
									<div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
										<Users className="text-white text-sm" />
									</div>
									<span className="text-white font-semibold">{name}</span>
								</div>
							</div>
						) : (
							<div className="flex items-center gap-4 max-md:flex-col">
								<div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 text-center">
									<div className="text-white/90 font-semibold mb-2">ÚČASTNÍK</div>
									<Button variant="success" size="sm"><Link href="/">Přihlásit</Link></Button>
								</div>
								<div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 text-center">
									<div className="text-white/90 font-semibold mb-2">ORGANIZÁTOR</div>
									<div className="flex gap-2">
										<Button variant="info" size="sm"><Link href="/login">Přihlásit</Link></Button>
										<Button variant="primary" size="sm"><Link href="register">Registrovat</Link></Button>
									</div>
								</div>
							</div>
						)}
					</nav>
				</div>
			</div>
		</header>
	)
}
