"use client";

import MenuCard from "@/components/card/MenuCard";
import Item from "@/components/Item";
import Loader from "@/components/Loader";
import PageTitle from "@/components/PageTitle";
import { useToast } from "@/components/Toast";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

interface MarketplaceItem {
	id: number;
	title: string;
	description: string;
	price: number;
	user: {
		id: string;
		name: string;
	};
}

export default function MarketplacePage() {
	const [loading, setLoading] = useState(true);
	const [offers, setOffers] = useState<MarketplaceItem[]>([]);

	const { showError, showInfo, showSuccess } = useToast();
	const { data: session } = useSession();

	const params = useParams();
	const campUrl = params.camp_url;

	const actions = [
		{
			title: "Nabídnout předmět",
			description:
				"Nabídněte svůj předmět k zakoupení ostatními uživateli.",
			link: campUrl ? `/${campUrl}/marketplace/add` : "/marketplace/add",
		},
		{
			title: "Zobrazit vaše nabídky",
			description:
				"Podívejte se na předměty, které jste nabídli k prodeji.",
			link: campUrl
				? `/${campUrl}/marketplace/offers`
				: "/marketplace/offers",
		},
	];

	const fetchMarketplaceItems = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/marketplace/items");
			if (response.ok) {
				const data = await response.json();
				setOffers(data);
				// The info message for no offers will now be handled by filteredOffers check
				// if (data.length === 0) {
				// 	showInfo(
				// 		"Na tržišti nejsou aktuálně k dispozici žádné předměty."
				// 	);
				// }
			} else {
				showError("Nepodařilo se načíst předměty z tržiště.");
			}
			setLoading(false);
		} catch (error) {
			showError("Při načítání předmětů došlo k neočekávané chybě.");
			console.error(error);
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchMarketplaceItems();
	}, [showError, showInfo]);

	const handleBuy = async (itemId: number) => {
		try {
			const response = await fetch("/api/marketplace/buy", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ itemId }),
			});

			if (response.ok) {
				showSuccess("Předmět byl úspěšně zakoupen.");
				fetchMarketplaceItems();
			} else {
				const data = await response.json();
				showError(data.error || "Při nákupu předmětu došlo k chybě.");
			}
		} catch (error) {
			showError("Při nákupu předmětu došlo k neočekávané chybě.");
			console.error(error);
		}
	};

	const filteredOffers = useMemo(() => {
		if (!session?.user) {
			return offers;
		}
		return offers.filter((offer) => offer.user.id != session.user.id);
	}, [offers, session?.user]);

	return (
		<>
			<PageTitle>Tržiště</PageTitle>
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
				Předměty na tržišti
			</h2>
			{loading ? (
				<Loader />
			) : filteredOffers.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{filteredOffers.map((offer) => (
						<Item
							key={offer.id}
							title={offer.title}
							description={offer.description}
							price={offer.price}
							type="offered"
							user={offer.user.name}
							onBuy={() => handleBuy(offer.id)}
						/>
					))}
				</div>
			) : (
				<p className="text-center text-gray-400">
					Na tržišti nejsou aktuálně k dispozici žádné předměty, které
					byste si mohli koupit.
				</p>
			)}
		</>
	);
}
