"use client";

import { usePathname } from "next/navigation";
import BackButton from "./BackButton";

export default function ConditionalBackButton() {
	const pathname = usePathname();
	const hiddenPaths = ["/", "/login", "/signup", "/unauthorized"];

	// Only show the back button if the user is not on the homepage
	if (hiddenPaths.includes(pathname)) {
		return null;
	}

	return <BackButton />;
}
