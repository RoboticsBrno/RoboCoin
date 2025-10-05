"use client";

import { usePathname } from "next/navigation";
import BackButton from "./BackButton";

export default function ConditionalBackButton() {
	const pathname = usePathname();
	const pathSegments = pathname.split("/").filter(Boolean);

	if (pathSegments.length <= 1) {
		return null;
	}

	return <BackButton />;
}
