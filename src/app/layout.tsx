import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./globals.css";
import { Header } from "@/components/Header";
import { AuthProvider } from "@/utils/auth-context";
import { cookies } from "next/headers";
import { COOKIE_TOKEN, COOKIE_USER_TOKEN } from "@/config";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "RoboCoin",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const cookieStore = await cookies();
	let cookie = cookieStore.get(COOKIE_TOKEN);

	let id = cookie?.value;

	const initialIsAdmin = !!id;
	if (!id) {
		cookie = cookieStore.get(COOKIE_USER_TOKEN);
		id = cookie?.value;
	}
	const initialIsLoggedIn = !!id;

	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<AuthProvider initialIsLoggedIn={initialIsLoggedIn} initialIsAdmin={initialIsAdmin}>
					<Header />
					{children}
				</AuthProvider>
			</body>
		</html>
	);
}
