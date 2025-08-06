"use client";

import Alert from "@/components/Alert";
import Item from "@/components/Item";
import Loader from "@/components/Loader";
import PageTitle from "@/components/PageTitle";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function YourItemsPage() {
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState<string | null>(null);
	const [messageType, setMessageType] = useState<"success" | "danger">("success");
	const [items, setItems] = useState<any[]>([]);

	const { data: session, status } = useSession();

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
					setMessage("Failed to fetch items");
					setMessageType("danger");
					throw new Error("Failed to fetch items");
				}
				const data = await response.json();
				console.log("Fetched items:", data);
				setItems(data);
			} catch (error) {
				console.error("Error fetching items:", error);
				setMessage("An unexpected error occurred while fetching items.");
				setMessageType("danger");
			} finally {
				setLoading(false);
			}
		};

		fetchItems();
	}, [session, status]);

	return (
		<>
			<PageTitle>Your Items</PageTitle>
			{message && (
				<Alert variant={messageType} message={message} />
			)}
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
