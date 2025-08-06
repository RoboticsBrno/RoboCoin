import { Prisma } from "@prisma/client";

type TransactionClient = Prisma.TransactionClient;

export async function syncUserInventory(
	tx: TransactionClient,
	userId: number,
	desiredItemIds: Set<number>
) {
	const currentInventory = await tx.inventory.findMany({
		where: { user: userId },
		select: {
			item: true,
			item_inventory_itemToitem: { select: { price: true } },
		},
	});

	const currentItems = new Map(
		currentInventory.map((inv) => [
			inv.item,
			inv.item_inventory_itemToitem.price,
		])
	);
	const currentItemIds = new Set(currentItems.keys());

	const idsToAdd = [...desiredItemIds].filter(
		(id) => !currentItemIds.has(id)
	);
	const idsToRemove = [...currentItemIds].filter(
		(id) => !desiredItemIds.has(id)
	);

	// Update inventory
	if (idsToRemove.length > 0) {
		await tx.inventory.deleteMany({
			where: { user: userId, item: { in: idsToRemove } },
		});
	}
	if (idsToAdd.length > 0) {
		await tx.inventory.createMany({
			data: idsToAdd.map((itemId) => ({
				user: userId,
				item: itemId,
				quantity: 1,
			})),
		});
	}

	// Calculate balance change
	const priceOfItemsToRemove = idsToRemove.reduce(
		(sum, id) => sum + (currentItems.get(id) || 0),
		0
	);

	let priceOfItemsToAdd = 0;
	if (idsToAdd.length > 0) {
		const addedItems = await tx.item.findMany({
			where: { id: { in: idsToAdd } },
			select: { price: true },
		});
		priceOfItemsToAdd = addedItems.reduce(
			(sum, item) => sum + item.price,
			0
		);
	}

	const netChange = priceOfItemsToAdd - priceOfItemsToRemove;

	// Update balance
	if (netChange !== 0) {
		await tx.balance.update({
			where: { user: userId },
			data: { amount: { increment: netChange } },
		});
	}
}

export async function syncItemHolders(
	tx: TransactionClient,
	itemId: number,
	desiredUserIds: Set<number>
) {
	const item = await tx.item.findUnique({
		where: { id: itemId },
		select: { price: true },
	});

	if (!item) {
		throw new Error(`Item with ID ${itemId} not found.`);
	}
	const itemPrice = item.price;

	const currentInventory = await tx.inventory.findMany({
		where: { item: itemId },
		select: { user: true },
	});
	const currentUserIds = new Set(currentInventory.map((inv) => inv.user));

	const usersToAdd = [...desiredUserIds].filter(
		(id) => !currentUserIds.has(id)
	);
	const usersToRemove = [...currentUserIds].filter(
		(id) => !desiredUserIds.has(id)
	);

	// Update inventory
	if (usersToRemove.length > 0) {
		await tx.inventory.deleteMany({
			where: { item: itemId, user: { in: usersToRemove } },
		});
	}
	if (usersToAdd.length > 0) {
		await tx.inventory.createMany({
			data: usersToAdd.map((userId) => ({
				user: userId,
				item: itemId,
				quantity: 1,
			})),
		});
	}

	// Update balances
	if (itemPrice !== 0) {
		if (usersToRemove.length > 0) {
			await tx.balance.updateMany({
				where: { user: { in: usersToRemove } },
				data: { amount: { decrement: itemPrice } },
			});
		}
		if (usersToAdd.length > 0) {
			await tx.balance.updateMany({
				where: { user: { in: usersToAdd } },
				data: { amount: { increment: itemPrice } },
			});
		}
	}
}
