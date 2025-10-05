"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useCamp() {
	const params = useParams();
	const campUrl = params.camp_url as string;
	const { status } = useSession();

	const { data, isLoading, mutate } = useSWR(
		campUrl ? [`/api/camps/${campUrl}`, status] : null,
		([url]) => fetcher(url)
	);

	return { camp: data, isLoading, mutate };
}
