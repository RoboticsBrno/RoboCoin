"use client";

import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import Button from "@/components/Button";
import Loader from "@/components/Loader";
import PageTitle from "@/components/PageTitle";
import { useBalance } from "@/hooks/useBalance";
import { ItemWithUser } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { useCurrencySymbol } from "@/hooks/useCurrencySymbol";
interface ItemPageClientProps {
	id: string;
}

export default function ItemPageClient({ id }: ItemPageClientProps) {
	const { data: session } = useSession();
	const [item, setItem] = useState<ItemWithUser | null>(null);
	const [loading, setLoading] = useState(true);
	const [isBuying, setIsBuying] = useState(false);
	const [bought, setBought] = useState(false);

	const campCurrency = useCurrencySymbol();

	const { balance, mutate } = useBalance();
	const { showError, showSuccess } = useToast();

	useEffect(() => {
		const fetchItem = async () => {
			if (isNaN(parseInt(id))) {
				showError("Invalid item ID");
				setLoading(false);
				return;
			}

			const response = await fetch(`/api/marketplace/item/${id}`);
			if (!response.ok) {
				const errorData = await response.json();
				showError("An error occurred");
				console.error("Error fetching item:", errorData.error);
			} else {
				const itemData = await response.json();
				setItem(itemData);
			}
			setLoading(false);
		};

		fetchItem();
	}, [id, showError]);

	const handleBuy = async () => {
		setIsBuying(true);

		if (!item) {
			showError("Položka nebyla nalezena");
			setIsBuying(false);
			return;
		}

		const response = await fetch("/api/marketplace/buy", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ id: item.id }),
		});

		if (!response.ok) {
			const errorData = await response.json();
			showError(errorData.error || "Failed to purchase item");
			console.error("Error purchasing item:", errorData.error);
		} else {
			showSuccess("Položka byla úspěšně zakoupena");
			setBought(true);
			mutate();
		}

		setIsBuying(false);
	};

	if (loading) {
		return <Loader />;
	}

	if (!item) {
		return (
			<div className="bg-red-900 border-red-700 text-red-200 relative p-4 my-4 border-l-4 rounded-md shadow-lg">
				Položka nebyla nalezena
			</div>
		);
	}

	if (!balance && balance !== 0) {
		return (
			<div className="bg-red-900 border-red-700 text-red-200 relative p-4 my-4 border-l-4 rounded-md shadow-lg">
				Nepodařilo se načíst váš zůstatek. Zkuste to prosím znovu
			</div>
		);
	}

	const canAfford = balance !== null && balance >= item.price;

	return (
		<>
			{item && <PageTitle>{item.title} </PageTitle>}
			<div className="flex justify-center items-center">
				<div className="w-full md:w-1/2">
					{item && (
						<>
							<div className="text-lg">
								<span className="font-bold"> Popis: </span>{" "}
								{item.description}
							</div>
							<div className="text-lg">
								<span className="font-bold"> Cena: </span>
								{item.price} {campCurrency}
							</div>
							<div className="text-lg">
								<span className="font-bold"> Nabízí: </span>{" "}
								{item.user.name}
							</div>
						</>
					)}
					{session &&
						item &&
						parseInt(session.user.id) !== item.owner &&
						item.on_marketplace && (
							<div className="mt-4">
								{!bought && (
									<Button
										onClick={handleBuy}
										disabled={!canAfford || isBuying}
									>
										{isBuying ? "Pracuji..." : "Koupit"}
									</Button>
								)}
								{!canAfford && (
									<p className="text-red-500 text-sm mt-2">
										Nemáte dostatek prostředků na zakoupení
										této položky.
									</p>
								)}
							</div>
						)}
				</div>
			</div>
		</>
	);
}
