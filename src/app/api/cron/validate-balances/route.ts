import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { user } from "../../../../../generated/prisma";

async function validateForCamp(
	user: user,
	camp: number,
	operations: Prisma.PrismaPromise<any>[],
) {
	const inventoryItems = await prisma.inventory.findMany({
		where: { user: user.id, quantity: { gt: 0 } },
		include: {
			item_inventory_itemToitem: { select: { price: true } },
		},
	});
	const achievementsBalance = inventoryItems.reduce(
		(sum, inv) => sum + inv.item_inventory_itemToitem.price,
		0
	);

	const sentTransactions = await prisma.transaction.aggregate({
		_sum: { amount: true },
		where: { sender: user.id },
	});
	const receivedTransactions = await prisma.transaction.aggregate({
		_sum: { amount: true },
		where: { receiver: user.id },
	});
	const sentAmount = sentTransactions._sum.amount || 0;
	const receivedAmount = receivedTransactions._sum.amount || 0;
	const netTransactionAmount = receivedAmount - sentAmount;

	const correctBalance = achievementsBalance + netTransactionAmount;

	const currentBalance = await prisma.balance.findUnique({
		where: {
			user_camp: { user: user.id, camp },
		}
	});

	const currentBalanceAmount = currentBalance?.amount || 0;

	if (currentBalanceAmount !== correctBalance) {
		operations.push(
			prisma.balance.upsert({
				where: { user_camp: { user: user.id, camp } },
				update: { amount: correctBalance },
				create: { user: user.id, amount: correctBalance },
			})
		);
	}
}


export async function GET() {
	try {
		const users = await prisma.user.findMany({
			where: { user_camp_user_camp_userTouser: { some: { is_admin: false } } },
		});
		const operations: any[] = [];

		for (const user of users) {
			const camps = await prisma.user_camp.findMany({
				where: { user: user.id },
				include: { camp_user_camp_campTocamp: { select: { id: true } } },
			});

			for (const userCamp of camps) {
				await validateForCamp(user, userCamp.camp_user_camp_campTocamp.id, operations);
			}
		}

		if (operations.length > 0) {
			await prisma.$transaction(operations);
		}

		return NextResponse.json(
			{
				message: `Balance validation complete. ${operations.length} balances updated.`,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Failed to validate balances:", error);
		return NextResponse.json(
			{ error: "An error occurred during balance validation." },
			{ status: 500 }
		);
	}
}
