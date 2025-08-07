"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import TransactionsTable from "@/components/TransactionsTable";
import Alert from "@/components/Alert";
import PageTitle from "@/components/PageTitle";
import Loader from "@/components/Loader";
import { TransactionWithUsers } from "@/lib/transactions";

export default function TransactionsPage() {
	const [transactions, setTransactions] = useState<TransactionWithUsers[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { data: session } = useSession();

	useEffect(() => {
		const fetchTransactions = async () => {
			if (!session) return;

			try {
				const response = await fetch("/api/transactions");
				if (response.ok) {
					const data: TransactionWithUsers[] = await response.json();
					setTransactions(data);
				} else {
					setError("Failed to fetch transactions.");
				}
			} catch (err) {
				setError("An unexpected error occurred.");
			} finally {
				setLoading(false);
			}
		};

		fetchTransactions();
	}, [session]);

	if (loading) {
		return (
			<>
				<PageTitle>Transactions</PageTitle>
				<Loader />
			</>
		);
	}

	if (error) {
		return (
			<>
				<PageTitle>Transactions</PageTitle>
				<Alert variant="danger" message={error} />
			</>
		);
	}

	return (
		<>
			<PageTitle>Transactions</PageTitle>
			{session?.user?.id && (
				<TransactionsTable
					transactions={transactions}
					userId={session.user.id}
				/>
			)}
		</>
	);
}
