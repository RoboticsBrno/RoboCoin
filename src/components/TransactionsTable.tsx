"use client";

import { useMemo } from "react";
import Card from "@/components/card/Card";
import { TransactionWithUsers } from "@/lib/transactions";
import Button from "./Button";
import { useCurrencySymbol } from "@/hooks/useCurrencySymbol";

interface TransactionsTableProps {
	transactions: TransactionWithUsers[];
	userId: number;
	onRefund?: (transactionId: number) => void;
}

export default function TransactionsTable({
	transactions,
	userId,
	onRefund,
}: TransactionsTableProps) {
	const campCurrency = useCurrencySymbol();

	const { processedTransactions } = useMemo(() => {
		const refundedIds = new Set<number>();
		const refundTransactions = new Set<number>();

		transactions.forEach((tx) => {
			const refundMatch = tx.description?.match(
				/Vratka transakce #(\d+)/
			);
			if (refundMatch) {
				const originalTxId = parseInt(refundMatch[1], 10);
				refundedIds.add(originalTxId);
				refundTransactions.add(tx.id);
			}
		});

		const processed = transactions.map((tx) => ({
			...tx,
			isOutgoing: tx.sender == userId,
			peer:
				tx.sender == userId
					? tx.user_transaction_receiverTouser
					: tx.user_transaction_senderTouser,
			isRefund: refundTransactions.has(tx.id),
			isRefunded: refundedIds.has(tx.id),
		}));

		return { processedTransactions: processed };
	}, [transactions, userId]);

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
			{processedTransactions.map((tx) => (
				<Card key={tx.id}>
					<div className="flex flex-col justify-between h-full">
						<div>
							<h2 className="text-xl font-semibold text-white mb-2">
								{tx.peer?.name || "Neznámý uživatel"}
							</h2>
							{tx.description && (
								<p className="text-gray-400 mb-4">
									{tx.description || "Popis není k dispozici"}
								</p>
							)}
							{tx.isOutgoing ? (
								<p className="text-red-400 font-bold">
									- {tx.amount} {campCurrency}
								</p>
							) : (
								<p className="text-green-400 font-bold">
									+ {tx.amount} {campCurrency}
								</p>
							)}
							{tx.isRefunded && (
								<p className="text-yellow-400 text-sm mt-2">
									Vráceno
								</p>
							)}
							{onRefund && !tx.isRefunded && !tx.isRefund && (
								<Button
									onClick={() => onRefund(tx.id)}
									className="mt-4"
								>
									Vrátit peníze
								</Button>
							)}
						</div>
						<p className="text-gray-400">#{tx.id}</p>
					</div>
				</Card>
			))}
		</div>
	);
}
