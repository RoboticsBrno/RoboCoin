"use client";

import Item from "@/components/Item";
import Loader from "@/components/Loader";
import PageTitle from "@/components/PageTitle";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { item } from "../../../../../generated/prisma";
import { useToast } from "@/components/Toast";

export default function YourItemsPage() {
	const [loading, setLoading] = useState(true);
	const [items, setItems] = useState<any[]>([]);

	const { data: session, status } = useSession();

	const { showError } = useToast();

	useEffect(() => {
		if (status === "loading") return; // Don't fetch until session is loaded

		const fetchItems = async () => {
			if (!session) {
				setLoading(false);
				return;
			}
			try {
				const response = await fetch(`/api/my-items`);
				if (!response.ok) {
					showError("Failed to fetch items");
					throw new Error("Failed to fetch items");
				}
				const data: item[] = await response.json();
				setItems(data);
			} catch (error) {
				console.error("Error fetching items:", error);
				showError("An unexpected error occurred while fetching items.");
			} finally {
				setLoading(false);
			}
		};

		fetchItems();
	}, [session, status]);

	return (
		<>
			<PageTitle>Your Items</PageTitle>
			{loading ? (
				<Loader />
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{items.map((item, index) => (
						<Item
							key={index}
							title={item.title}
							description={item.description}
							price={item.price}
						/>
					))}
				</div>
			)}
		</>
	);
}
