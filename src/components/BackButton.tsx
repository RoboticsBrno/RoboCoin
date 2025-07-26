"use client";

import { useRouter } from "next/navigation";
import Button from "./Button"; // Using our existing Button component for consistent styling

export default function BackButton() {
	const router = useRouter();

	return (
		<div className="mb-2">
			<Button onClick={() => router.back()} variant="secondary" size="sm">
				&lt;&nbsp;&nbsp;Back
			</Button>
		</div>
	);
}
