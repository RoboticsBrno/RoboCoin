"use client";

import Item from "@/components/Item";
import Loader from "@/components/Loader";
import PageTitle from "@/components/PageTitle";
import { useToast } from "@/components/Toast";
import { useEffect, useState, useCallback } from "react";

interface Offer {
    id: number;
    title: string;
    description: string;
    price: number;
    user?: {
        name: string;
    };
}

export default function OffersPage() {
    const [loading, setLoading] = useState(true);
    const [offersUp, setOffersUp] = useState<Offer[]>([]);
    const [offersSold, setOffersSold] = useState<Offer[]>([]);
    const [offersDown, setOffersDown] = useState<Offer[]>([]);

    const { showError, showInfo } = useToast();

    const fetchOffers = useCallback(async () => {
        setLoading(true);
        try {
            const [upResponse, soldResponse, downResponse] = await Promise.all([
                fetch("/api/marketplace/offers/up"),
                fetch("/api/marketplace/offers/sold"),
                fetch("/api/marketplace/offers/down"),
            ]);

            if (upResponse.ok) {
                const data = await upResponse.json();
                setOffersUp(data);
                if (data.length === 0) {
                    showInfo("Žádné položky nejsou aktuálně na prodej.");
                }
            } else {
                showError("Failed to fetch offers that are up.");
            }

            if (soldResponse.ok) {
                const data = await soldResponse.json();
                setOffersSold(data);
                if (data.length === 0) {
                    showInfo("Žádné položky nebyly prodány.");
                }
            } else {
                showError("Failed to fetch sold offers.");
            }

            if (downResponse.ok) {
                const data = await downResponse.json();
                setOffersDown(data);
                if (data.length === 0) {
                    showInfo(
                        "Žádné položky nejsou staženy z tržiště."
                    );
                }
            } else {
                console.error("Failed to fetch items down from marketplace.");
                showError("Failed to fetch items down from marketplace.");
            }
        } catch (error) {
            showError("An unexpected error occurred while fetching items.");
            console.error("Error fetching offers:", error);
        } finally {
            setLoading(false);
        }
    }, [showError, showInfo]);

    useEffect(() => {
        fetchOffers();
    }, [fetchOffers]);

    const handleRemove = async (id: number) => {
        await fetch(`/api/marketplace/offers/remove/${id}`, {
            method: "POST",
        });
        fetchOffers();
    };

    const handleAdd = async (id: number) => {
        await fetch(`/api/marketplace/offers/add/${id}`, {
            method: "POST",
        });
        fetchOffers();
    };

    return (
        <>
            <PageTitle>Your Offers</PageTitle>
            {loading ? (
                <Loader />
            ) : (
                <>
                    {offersUp.length > 0 && (
                        <>
                            <h1 className="text-2xl font-bold mb-4">
                                Předměty na prodej
                            </h1>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {offersUp.map((offer) => (
                                    <Item
                                        key={offer.id}
                                        title={offer.title}
                                        description={offer.description}
                                        price={offer.price}
                                        onRemove={() => handleRemove(offer.id)}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                    {offersSold.length > 0 && (
                        <>
                            <h1 className="text-2xl font-bold mt-8 mb-4">
                                Prodané předměty
                            </h1>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {offersSold.map((offer) => (
                                    <Item
                                        key={offer.id}
                                        title={offer.title}
                                        description={offer.description}
                                        price={offer.price}
                                        type="bought"
                                        user={offer.user?.name}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                    {offersDown.length > 0 && (
                        <>
                            <h1 className="text-2xl font-bold mt-8 mb-4">
                                Předměty stažené z tržiště
                            </h1>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {offersDown.map((offer) => (
                                    <Item
                                        key={offer.id}
                                        title={offer.title}
                                        description={offer.description}
                                        price={offer.price}
                                        onAdd={() => handleAdd(offer.id)}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}
        </>
    );
}
