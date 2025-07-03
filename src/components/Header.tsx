"use client";

import { logout } from "@/lib/account";
import { useAuth } from "@/utils/auth-context";
import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { Coins, Users } from "lucide-react";
import Link from "next/link";
import { COOKIE_NAME, COOKIE_TOKEN, COOKIE_USER_NAME, COOKIE_USER_TOKEN } from "@/config";

export function Header() {
	const { isLoggedIn, setIsLoggedIn, isAdmin } = useAuth();
	const [name, setName] = useState("Guest");

	const handleLogout = async () => {
		await logout();
		setIsLoggedIn(false);
		localStorage.removeItem(COOKIE_TOKEN);
		localStorage.removeItem(COOKIE_NAME);
		localStorage.removeItem(COOKIE_USER_TOKEN);
		localStorage.removeItem(COOKIE_USER_NAME);
		window.location.href = "/";
	};

	useEffect(() => {
		const storedName = localStorage.getItem(COOKIE_NAME) || localStorage.getItem(COOKIE_USER_NAME);
		setName(storedName);
	}, [isLoggedIn]);

	return (
		<header className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 shadow-2xl">
			<div className="container mx-auto px-6 py-6">
				<div className="flex items-center justify-between max-lg:flex-col max-lg:flex-wrap">
					<div className="flex items-center gap-4 max-lg:mb-4">
						<div className="bg-white/20 rounded-full p-3 animate-pulse">
							<Coins className="text-white text-2xl" />
						</div>
						<h1 className="text-4xl font-bold text-white tracking-wider">RoboCoin</h1>
					</div>

					<nav className="flex items-center">
						{isLoggedIn ? (
							<div className="flex items-center max-sm:flex-col">
								<div className="mr-3 max-sm:mr-0 flex min-sm:flex-col items-end max-sm:mb-3">
									<Top10 className="" containerClass={isLoggedIn ? "min-sm:mb-2" : ""} />
									{isAdmin ? (<Dashboard className="max-sm:ml-3" />) : null}
									{!isAdmin ? (<Inventory />) : null}
								</div>
								<div className="flex items-center gap-6 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
									<Button variant="secondary" size="sm" onClick={handleLogout}>Odhlásit</Button>
									<div className="flex items-center gap-2">
										<div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
											<Users className="text-white text-sm" />
										</div>
										<span className="text-white font-semibold">{name}</span>
									</div>
								</div>
							</div>
						) : (
							<div className="flex items-center gap-4 max-sm:flex-wrap justify-center">
								<Top10 containerClass="max-md:hidden" />
								<div className="min-md:bg-white/10 min-md:backdrop-blur-sm rounded-2xl min-md:px-6 min-md:py-4 text-center max-md:flex">
									<div className="text-white/90 font-semibold mb-2 max-md:hidden">ÚČASTNÍK</div>
									<Top10 className="min-md:hidden" containerClass="mr-2" />
									<Button variant="success" size="sm"><Link href="/">Přihlásit</Link></Button>
								</div>
								<div className="min-md:bg-white/10 min-md:backdrop-blur-sm rounded-2xl min-md:px-6 min-md:py-4 text-center">
									<div className="text-white/90 font-semibold mb-2 max-md:hidden">ORGANIZÁTOR</div>
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

function Top10({ className = "", containerClass = "" }: { className?: string, containerClass?: string }) {
	return (
		<div className={containerClass}>
			<Button variant="primary" size="sm" className={className}>
				<Link href="/top" className="flex items-center gap-2">
					<Podium />
					Top&nbsp;10
				</Link>
			</Button>
		</div>
	);

}

function Podium() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M10 4h4" />
			<path d="M12 2v4" />
			<path d="M9 15a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1" />
			<path d="M9 21V11a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v10" />
		</svg>
	);
}

function Dashboard({ className = "" }: { className?: string }) {
	return (
		<div className={className}>
			<Button variant="success" size="sm">
				<Link href="/dashboard" className="flex items-center gap-2">
					<Users />
					Dashboard
				</Link>
			</Button>
		</div>
	);
}

function Inventory() {
	return (
		<div>
			<Button variant="success" size="sm">
				<Link href="/" className="flex items-center gap-2">
					<Coins />
					Inventář
				</Link>
			</Button>
		</div>
	);
}

