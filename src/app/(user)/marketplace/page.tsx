"use client";

import Alert from "@/components/Alert";
import Card from "@/components/card/Card";
import MenuCard from "@/components/card/MenuCard";
import Item from "@/components/Item";
import Loader from "@/components/Loader";
import PageTitle from "@/components/PageTitle";
import { useEffect, useState } from "react";

export default function MarketplacePage() {
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState<string | null>(null);
	const [messageType, setMessageType] = useState<"success" | "danger">("success");
	const [offers, setOffers] = useState([]);

	const actions = [
		{ title: 'Offer item', description: 'Offer your item to be bought by other users.', link: '/marketplace/add' },
		{ title: 'View your offers', description: 'See the items you have offered for sale.', link: '/marketplace/offers' },
	];

	useEffect(() => {
		const fetchMarketplaceItems = async () => {
			setLoading(true);
			try {
				const response = await fetch("/api/marketplace/items");
				if (response.ok) {
					const data = await response.json();
					setOffers(data);
				} else {
					setMessage("Failed to fetch marketplace items.");
					setMessageType("danger");
				}
				setLoading(false);
			} catch (error) {
				setMessage("An unexpected error occurred while fetching items.");
				setMessageType("danger");
				setLoading(false);
			}
		};
		fetchMarketplaceItems();
	}, []);

	return (
		<>
			<PageTitle>Marketplace</PageTitle>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
				{actions.map((action, index) => (
					<MenuCard
						key={index}
						title={action.title}
						description={action.description}
						href={action.link}
					/>
				))}
			</div>
			<h2 className="text-2xl font-bold text-white mt-8 mb-4">Marketplace Items</h2>
			{loading ? (
				<Loader />
			) : (
				offers.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
						{offers.map((offer) => (
							<Item key={offer.id}
								title={offer.title}
								description={offer.description}
								price={offer.price}
								href={`/marketplace/item/${offer.id}`}
								type="offered"
								user={offer.user.name}
							/>
						))}
					</div>
				) : (
					message ? (
						<Alert variant={messageType} message={message} closeButton={false} />
					) : (
						<Alert variant="info"
							message="No items available in the marketplace at the moment."
							closeButton={false}
						/>
					)
				)
			)}
		</>
	);
}
