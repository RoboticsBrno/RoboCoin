import { useUserRole } from "@/hooks/useUserRole";
import Link from "next/link";
import React from "react";

interface CardProps {
	href: string;
	title: string;
	description: string;
	type?: "org" | "admin";
	hover?: boolean;
}

export default function MenuCard({
	href,
	title,
	description,
	type,
	hover = true,
}: CardProps) {
	const { is_org, is_admin } = useUserRole();

	if (type === "org" && !is_org) return null;
	if (type === "admin" && !is_admin) return null;

	let className = "";
	let descriptionClass = "text-gray-400";
	if (type === "org") {
		className =
			"bg-blue-600 text-white border border-blue-700";
		if (hover) {
			className += " hover:bg-blue-700";
		}
		descriptionClass = "text-gray-300";
	} else if (type === "admin") {
		className =
			"bg-red-600 text-white border border-red-700";
		if (hover) {
			className += " hover:bg-red-700";
		}
		descriptionClass = "text-gray-200";
	} else {
		className =
			"bg-gray-800 text-white border border-gray-700";
		if (hover) {
			className += " hover:bg-gray-700";
		}
	}

	return (
		<Link
			href={href}
			className={`block p-6 rounded-sm transition-colors duration-200 w-full ${className}`}
		>
			<h5 className="mb-2 text-2xl font-bold tracking-tight text-white">
				{title}
			</h5>
			<p className={`font-normal ${descriptionClass}`}>{description}</p>
		</Link>
	);
}
