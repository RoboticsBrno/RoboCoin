"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetch";
import { BalanceResponse } from "@/types";

export function useBalance() {
    const { data: session, update } = useSession();
    const updateRef = useRef(update);

    useEffect(() => {
        updateRef.current = update;
    });

    const { data, isLoading, mutate } = useSWR<BalanceResponse>(
        "/api/balance",
        fetcher,
        {
            refreshInterval: 5 * 60 * 1000,
        }
    );

    useEffect(() => {
        if (data && data.balance !== session?.user?.balance) {
            updateRef.current({ balance: data.balance || undefined });
        }
    }, [data, session?.user?.balance]);

    return { balance: session?.user?.balance, isLoading, mutate };
}
