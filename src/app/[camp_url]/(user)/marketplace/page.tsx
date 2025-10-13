"use client";

import MenuCard from "@/components/card/MenuCard";
import Item from "@/components/Item";
import Loader from "@/components/Loader";
import PageTitle from "@/components/PageTitle";
import { useToast } from "@/components/Toast";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface MarketplaceItem {
	id: number;
	title: string;
	description: string;
	price: number;
	user: {
		name: string;
	};
}

interface AuctionItem extends MarketplaceItem {
	highestBid: number;
}

export default function MarketplacePage() {
	const [loading, setLoading] = useState(true);
	const [offers, setOffers] = useState<MarketplaceItem[]>([]);

	const { showError, showInfo } = useToast();

	const params = useParams();
	const campUrl = params.camp_url;

	const actions = [
		{
			title: "Offer item",
			description: "Offer your item to be bought by other users.",
			link: campUrl ? `/${campUrl}/marketplace/add` : "/marketplace/add",
		},
		{
			title: "View your offers",
			description: "See the items you have offered for sale.",
			link: campUrl ? `/${campUrl}/marketplace/offers` : "/marketplace/offers",

		},
	];

	useEffect(() => {
		const fetchMarketplaceItems = async () => {
			setLoading(true);
			try {
				const response = await fetch("/api/marketplace/items");
				if (response.ok) {
					const data = await response.json();
					setOffers(data);
					if (data.length === 0) {
						showInfo("No items are currently available in the marketplace.");
					}
				} else {
					showError("Failed to fetch marketplace items.");
				}
				setLoading(false);
			} catch (error) {
				showError("An unexpected error occurred while fetching items.");
				console.error(error);
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
			<h2 className="text-2xl font-bold text-white mt-8 mb-4">
				Marketplace Items
			</h2>
			{loading ? (
				<Loader />
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{offers.map((offer) => (
						<Item
							key={offer.id}
							title={offer.title}
							description={offer.description}
							price={offer.price}
							href={`/${campUrl}/marketplace/item/${offer.id}`}
							type="offered"
							user={offer.user.name}
						/>
					))}
				</div>
			)}
		</>
	);
}
