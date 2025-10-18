import Link from "next/link";
import React from "react";

interface CardProps {
	href?: string;
	classReplacement?: string;
	children?: React.ReactNode;
}

export default function Card({ href, children, classReplacement }: CardProps) {
	let className =
		"bg-gray-800 hover:bg-gray-700 text-white border border-gray-700";
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
