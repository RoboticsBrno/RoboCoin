import React from "react";
import ItemPageClient from "./ItemClientPage";

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	return <ItemPageClient id={id} />;
}
