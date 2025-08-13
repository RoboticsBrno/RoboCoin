"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useBalance() {
	const { data: session, update } = useSession();

	const { data, isLoading } = useSWR("/api/balance", fetcher, {
		refreshInterval: 5 * 60 * 1000,
	});

	useEffect(() => {
		if (data && data.balance !== session?.user?.balance) {
			update({ balance: data.balance });
		}
	}, [data, session?.user?.balance, update]);

	return { balance: session?.user?.balance, isLoading };
}
