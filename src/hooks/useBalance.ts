"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";

const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

export function useBalance() {
	const { data: session, update } = useSession();
	const [isLoading, setIsLoading] = useState(false);

	const refreshBalance = useCallback(async () => {
		if (isLoading) return;
		setIsLoading(true);
		try {
			const response = await fetch("/api/balance");
			if (!response.ok) {
				throw new Error("Failed to fetch balance");
			}
			const data = await response.json();

			await update({ balance: data.balance });

		} catch (error) {
			console.error("Failed to refresh balance:", error);
		} finally {
			setIsLoading(false);
		}
	}, [isLoading, update]);
	useEffect(() => {
		const interval = setInterval(refreshBalance, REFRESH_INTERVAL);
		return () => clearInterval(interval);
	}, [refreshBalance]);

	return { ...session?.user, refreshBalance, isLoading };
}
