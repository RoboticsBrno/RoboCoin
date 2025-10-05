"use client";

import { useRouter } from "next/navigation";
import Button from "./Button"; // Using our existing Button component for consistent styling

export default function BackButton({ href }: { href?: string }) {
	const router = useRouter();

	const handleBack = () => {
		if (href) {
			router.push(href);
		} else {
			router.back();
		}
	}

	return (
		<div className="mb-2">
			<Button onClick={handleBack} variant="secondary" size="sm">
				&lt;&nbsp;&nbsp;Back
			</Button>
		</div>
	);
}
