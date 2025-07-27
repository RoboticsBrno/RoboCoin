import { DefaultArgs } from '@prisma/client/runtime/library';
import { PrismaClient } from '../../generated/prisma/client';

// Define the type for the Prisma transaction client
type TransactionClient = Omit<PrismaClient<{
	log: never[];
}, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">

/**
 * Recalculates a user's total balance based on the items in their inventory and updates the database.
 * This function is designed to be run within a Prisma transaction to ensure data consistency.
 *
 * @param tx - The Prisma transaction client.
 * @param userId - The ID of the user whose balance needs to be recalculated.
 */
export async function recalculateAndApplyBalance(tx: TransactionClient, user: number) {
	// 1. Fetch all items in the user's inventory
	const userInventory = await tx.inventory.findMany({
		where: { user },
		include: {
			item_inventory_itemToitem: {
				select: {
					price: true,
				},
			},
		},
	});

	// 2. Calculate the total value of all items in the inventory
	let totalValue = 0;
	for (const item of userInventory) {
		if (item.item_inventory_itemToitem?.price) {
			totalValue += item.item_inventory_itemToitem.price;
		}
	}
	// 3. Update the user's balance record
	// Using `upsert` is safer: it creates a balance record if one doesn't exist,
	// or updates it if it does.
	await tx.balance.upsert({
		where: { user },
		update: { amount: totalValue },
		create: { user, amount: totalValue },
	});
}
