import { prisma } from "@/lib/prisma";
import { Prisma } from "../../generated/prisma";

export type TransactionWithUsers = Prisma.transactionGetPayload<{
	include: {
		user_transaction_senderTouser: { select: { id: true; name: true } };
		user_transaction_receiverTouser: { select: { id: true; name: true } };
	};
}>;

export async function getTransactions(userId: number): Promise<TransactionWithUsers[]> {
	const transactions = await prisma.transaction.findMany({
		where: {
			OR: [{ sender: userId }, { receiver: userId }],
		},
		include: {
			user_transaction_senderTouser: { select: { id: true, name: true } },
			user_transaction_receiverTouser: {
				select: { id: true, name: true },
			},
		},
		orderBy: {
			created_at: "desc",
		},
	});
	return transactions;
}
