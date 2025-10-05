import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Provider from "./Provider";
import RoleProvider from "./RoleProvider";
import Header from "@/components/Header";
import ConditionalBackButton from "@/components/ConditionalBackButton"; // Import the new component
import { ToastProvider } from "@/components/Toast";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Robocoin V3",
	description:
		"Manage your Robocoins, trade on the marketplace, and view your achievements.",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`bg-gray-900 ${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<ToastProvider>
					<Provider>
						<RoleProvider>
							<Header />
							<div className={`container mx-auto p-8 pt-6`}>
								<ConditionalBackButton />{" "}
								{children}
							</div>
						</RoleProvider>
					</Provider>
				</ToastProvider>
			</body>
		</html>
	);
}