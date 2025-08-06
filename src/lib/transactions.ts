import { prisma } from "@/lib/prisma";

export async function getTransactions(userId: number) {
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
