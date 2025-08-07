"use client";

import { useSession } from 'next-auth/react';
import React, { useState, useEffect } from "react";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import Loader from "@/components/Loader";
import PageTitle from "@/components/PageTitle";
import { useBalance } from "@/hooks/useBalance";
import { useRouter } from "next/navigation";

import { ItemWithUser } from "@/lib/api";
interface ItemPageClientProps {
	id: string;
}

export default function ItemPageClient({ id }: ItemPageClientProps) {
	const { data: session } = useSession();
	const [item, setItem] = useState<ItemWithUser | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isBuying, setIsBuying] = useState(false);
	const [buyError, setBuyError] = useState<string | null>(null);
	const [buySuccess, setBuySuccess] = useState<string | null>(null);


	const router = useRouter();
	const { balance, refreshBalance } = useBalance();

	useEffect(() => {
		const fetchItem = async () => {
			if (isNaN(parseInt(id))) {
				setError("Invalid item ID");
				setLoading(false);
				return;
			}

			const response = await fetch(`/api/marketplace/item/${id}`);
			if (!response.ok) {
				const errorData = await response.json();
				setError(errorData.error);
			} else {
				const itemData = await response.json();
				setItem(itemData);
			}
			setLoading(false);
		};

		fetchItem();
	}, [id]);

	const handleBuy = async () => {
		setIsBuying(true);
		setBuyError(null);
		setBuySuccess(null);

		if (!item) {
			setBuyError("Item not found");
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
			setBuyError(errorData.error);
		} else {
			setBuySuccess("Item purchased successfully!");
			await refreshBalance();
			router.push("/marketplace");
		}

		setIsBuying(false);
	};

	if (loading) {
		return <Loader />;
	}

	if (error) {
		return <Alert variant="danger" message={error} />;
	}

	if (!item) {
		return <Alert variant="danger" message="Item not found" />;
	}

	if (!balance) {
		return <Alert variant="warning" message="Loading balance..." />;
	}

	const canAfford = balance !== null && balance >= item.price;

	console.log("Balance:", balance);

	return (
		<>
			{item && <PageTitle>{item.title} </PageTitle>}
			<div className="flex justify-center items-center" >
				<div className="w-full md:w-1/2" >
					{item && (
						<>
							<div className="text-lg" >
								<span className="font-bold" > Description: </span>{" "}
								{item.description}
							</div>
							< div className="text-lg" >
								<span className="font-bold" > Price: </span> $
								{item.price.toFixed(2)}
							</div>
							< div className="text-lg" >
								<span className="font-bold" > Owner: </span>{" "}
								{item.user.name}
							</div>
						</>
					)}
					{
						session &&
						item &&
						session.user.id !== item.owner &&
						item.on_marketplace && (
							<div className="mt-4" >
								<Button
									onClick={handleBuy}
									disabled={!canAfford || isBuying
									}
								>
									{isBuying ? "Processing..." : "Buy Now"}
								</Button>
								{
									!canAfford && (
										<p className="text-red-500 text-sm mt-2" >
											You don & apos;t have enough balance to buy
											this item.
										</p>
									)
								}
								{
									buyError && (
										<Alert
											variant="danger"
											message={buyError}
										/>
									)
								}
								{
									buySuccess && (
										<Alert
											variant="success"
											message={buySuccess}
										/>
									)
								}
							</div>
						)}
				</div>
			</div>
		</>
	);
}
