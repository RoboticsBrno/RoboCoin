import Link from "next/link";
import React from "react";

interface CardProps {
	href?: string;
	classReplacement?: string;
	children?: React.ReactNode;
	hover?: boolean;
}

export default function Card({ href, children, classReplacement, hover = true }: CardProps) {
	let className =
		"bg-gray-800 text-white border border-gray-700";
	if (hover) {
		className += " hover:bg-gray-700"
	}
	if (classReplacement) {
		className = classReplacement;
	}

	if (!href) {
		return (
			<div
				className={`block p-6 rounded-sm transition-colors duration-200 w-full ${className}`}
			>
				{children}
			</div>
		);
	}

	return (
		<Link
			href={href}
			className={`block p-6 rounded-sm transition-colors duration-200 w-full ${className}`}
		>
			{children}
		</Link>
	);
}
