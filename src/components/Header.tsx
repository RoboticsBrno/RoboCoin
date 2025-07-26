"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useUserRole } from "@/hooks/useUserRole";
import Button from "./Button";

export default function Header() {
    const { data: session } = useSession();
    const { is_org, is_admin } = useUserRole();

    return (
        <header className="bg-gray-800 shadow-md">
            <nav className="container mx-auto px-6 py-3 flex max-md:flex-wrap justify-between items-center">
                <Link href="/" className="text-2xl font-bold text-indigo-500">
                    RoboCoin
                </Link>
                <div className="flex items-center space-x-4">
                    {session ? (
                        <>
                            <span className="text-gray-300">
                                {session.user?.name}
                            </span>
                            <span className="text-gray-300 font-bold">
                                Balance: {session.user?.balance}
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
