import { Prisma } from "@/../generated/prisma/client";

type TransactionClient = Prisma.TransactionClient;

export async function transferBalance(
	tx: TransactionClient,
	fromId: number,
	toId: number,
	amount: number,
	description: string = "Balance transfer"
) {
	const fromBalance = await tx.balance.findUnique({
		where: { user: fromId },
	});

	if (!fromBalance || fromBalance.amount < amount) {
		throw new Error("Insufficient funds");
	}

	await tx.balance.update({
		where: { user: fromId },
		data: { amount: { decrement: amount } },
	});

	await tx.balance.update({
		where: { user: toId },
		data: { amount: { increment: amount } },
	});

	await tx.transaction.create({
		data: {
			sender: fromId,
			receiver: toId,
			amount,
			created_at: new Date(),
			description,
		},
	});
}
