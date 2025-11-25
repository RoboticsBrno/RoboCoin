"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import TransactionsTable from "@/components/TransactionsTable";
import PageTitle from "@/components/PageTitle";
import Loader from "@/components/Loader";
import { TransactionWithUsers } from "@/lib/transactions";
import { useToast } from "@/components/Toast";
import { fetcher, FetchError } from "@/lib/fetch";

export default function TransactionsPage() {
	const [transactions, setTransactions] = useState<TransactionWithUsers[]>(
		[]
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { data: session } = useSession();
	const { showError } = useToast();

	useEffect(() => {
		const fetchTransactions = async () => {
			if (!session) return;

			try {
				const data =
					await fetcher<TransactionWithUsers[]>("/api/transactions");
				setTransactions(data);
			} catch (err) {
				if (err instanceof FetchError) {
					setError(err.info.error);
				} else {
					setError("Došlo k neočekávané chybě.");
				}
			} finally {
				setLoading(false);
			}
		};

		fetchTransactions();
	}, [session]);

	useEffect(() => {
		if (error) {
			showError(error);
		}
	}, [error, showError]);

	if (loading) {
		return (
			<>
				<PageTitle>Transakce</PageTitle>
				<Loader />
			</>
		);
	}

	if (error) {
		return (
			<>
				<PageTitle>Transakce</PageTitle>
			</>
		);
	}

	return (
		<>
			<PageTitle>Transakce</PageTitle>
			{session?.user?.id && (
				<TransactionsTable
					transactions={transactions}
					userId={parseInt(session.user.id)}
				/>
			)}
		</>
	);
}
