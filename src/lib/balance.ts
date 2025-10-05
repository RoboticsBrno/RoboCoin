import { Prisma } from "@/../generated/prisma/client";

type TransactionClient = Prisma.TransactionClient;

export async function transferBalance(
	tx: TransactionClient,
	fromId: number,
	toId: number,
	amount: number,
	description: string = "Balance transfer",
	camp: number
) {
	const fromBalance = await tx.balance.findUnique({
		where: { user_camp: { user: fromId, camp } },
	});

	if (!fromBalance || fromBalance.amount < amount) {
		throw new Error("Insufficient funds");
	}

	await tx.transaction.create({
		data: {
			sender: fromId,
			receiver: toId,
			amount,
			created_at: new Date(),
			description,
			camp,
		},
	});
}
