"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Button from "./Button";
import { useBalance } from "@/hooks/useBalance";
import { useParams, usePathname } from "next/navigation";
import { useCamp } from "@/hooks/useCamp";
import getSymbolFromCurrency from "currency-symbol-map";

export default function Header() {
	const { data: session } = useSession();
	const { balance, isLoading } = useBalance();
	const { camp } = useCamp();

	const pathname = usePathname();

	const params = useParams();
	const campUrl = params.camp_url as string;

	const name = session?.user?.name;
	const is_manager = session?.user?.is_manager;

	return (
		<header className="bg-gray-800 shadow-md">
			<nav className="container mx-auto px-6 py-3 flex max-md:flex-wrap justify-between items-center">
				<div className="text-white">
					<Link href={campUrl ? `/${campUrl}` : '/'} className="text-2xl font-bold text-indigo-500">
						RoboCoin
					</Link>
					{is_manager && pathname !== "/" && (
						<Link href="/" className="text-white ms-5 hover:text-indigo-300">
							Manager Panel
						</Link>
					)}
				</div>
				<div className="flex items-center space-x-4">
					{name ? (
						<>
							<span className="text-gray-300">{name}</span>
							{session?.camp_url != null && (
								<span className="text-gray-300 font-bold">
									Balance: {isLoading ? "..." : balance || 0}{" "}
									{getSymbolFromCurrency(camp?.currency) || camp?.currency}
								</span>
							)}
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
							<Link href={campUrl ? `/${campUrl}/login` : "/login"}>
								<Button variant="info">Login</Button>
							</Link>
							<Link href={campUrl ? `/${campUrl}/signup` : "/signup"}>
								<Button variant="primary">Sign Up</Button>
							</Link>
						</>
					)}
				</div>
			</nav>
		</header>
	);
}
