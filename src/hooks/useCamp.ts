"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetch";
import { CampDetails } from "@/types";

export function useCamp() {
	const params = useParams();
	const campUrl = params.camp_url as string;
	const { status } = useSession();

	const { data, isLoading, mutate } = useSWR<CampDetails>(
		campUrl && status === 'authenticated' ? `/api/camps/${campUrl}` : null,
		fetcher
	);

	return { camp: data, isLoading, mutate };
}
