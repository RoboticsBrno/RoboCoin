"use client";

import { useMemo } from "react";
import Card from "@/components/card/Card";
import { TransactionWithUsers } from "@/lib/transactions";

interface ProcessedTransaction extends TransactionWithUsers {
	receiver: number;
	amount: number;
}

interface TransactionsTableProps {
	transactions: TransactionWithUsers[];
	userId: number;
}

export default function TransactionsTable({
	transactions,
	userId,
}: TransactionsTableProps) {
	console.log("Transactions:", transactions);
	const processedTransactions = useMemo(() => {
		console.log("Processing transactions for user ID:", userId);
		return transactions.map((tx) => ({
			...tx,
			isOutgoing: tx.sender == userId,
			peer:
				tx.sender == userId
					? tx.user_transaction_receiverTouser
					: tx.user_transaction_senderTouser,
		}));
	}, [transactions, userId]);
	console.log("Processed transactions:", processedTransactions);

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
			{processedTransactions.map((tx) => (
				<Card key={tx.id}>
					<h2 className="text-xl font-semibold text-white mb-2">
						{tx.peer?.name || "Unknown User"}
					</h2>
					{tx.description && (
						<p className="text-gray-400 mb-4">
							{tx.description || "No description available"}
						</p>
					)}
					{tx.isOutgoing ? (
						<p className="text-red-400 font-bold">
							- ${tx.amount.toFixed(2)}
						</p>
					) : (
						<p className="text-green-400 font-bold">
							+ ${tx.amount.toFixed(2)}
						</p>
					)}
				</Card>
			))}
		</div>
	);
}
