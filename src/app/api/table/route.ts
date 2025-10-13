/**
 * @swagger
 * /api/table:
 *   post:
 *     summary: Update user items and balances from a table
 *     tags: [Inventory]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserItems'
 *     responses:
 *       200:
 *         description: User items updated successfully
 *       403:
 *         description: Forbidden
 *       500:
 *         description: An error occurred while updating user items
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserItems } from "@/lib/api";

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session?.user || !session.user.is_org) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const camp = session.camp_id || -1;

	const userItems: UserItems = await req.json();

	try {
		const allDbItems = await prisma.item.findMany({
			where: { camp },
			select: { id: true, title: true, price: true, },
		});
		const itemMap = new Map(
			allDbItems.map((item) => [
				item.title,
				{ id: item.id, price: item.price },
			])
		);

		const userLogins = Object.keys(userItems);
		const allDbUsers = await prisma.user.findMany({
			where: {
				login: { in: userLogins },
			},
			select: { id: true, login: true },
		});
		const userMap = new Map(
			allDbUsers.map((user) => [user.login, user.id])
		);

		const userIds = Array.from(userMap.values());
		const itemIds = Array.from(itemMap.values());

		if (userIds.length === 0) {
			return NextResponse.json(
				{ message: "No users to update." },
				{ status: 200 }
			);
		}

		const currentInventory = await prisma.inventory.findMany({
			where: {
				user: { in: userIds },
				item: { in: itemIds.map((item) => item.id) },
				camp,
			},
		});

		const inventoryMap = new Map(
			currentInventory.map((inv) => [`${inv.user}-${inv.item}`, inv])
		);

		const operations: any[] = [];
		const balanceChanges = new Map<number, number>();

		for (const userLogin of userLogins) {
			const userId = userMap.get(userLogin);
			if (!userId) continue;

			const itemsForUser = userItems[userLogin];
			for (const itemTitle of Object.keys(itemsForUser)) {
				const itemData = itemMap.get(itemTitle);
				if (!itemData) continue;

				const { id: itemId, price } = itemData;

				const shouldHaveItem = itemsForUser[itemTitle];
				const inventoryEntry = inventoryMap.get(`${userId}-${itemId}`);
				const hasItem = !!inventoryEntry && inventoryEntry.quantity > 0;

				if (shouldHaveItem && !hasItem) {
					if (inventoryEntry) {
						operations.push(
							prisma.inventory.update({
								where: { id: inventoryEntry.id },
								data: { quantity: 1 },
							})
						);
						const currentChange = balanceChanges.get(userId) || 0;
						balanceChanges.set(userId, currentChange + price);
					} else {
						operations.push(
							prisma.inventory.create({
								data: {
									user: userId,
									item: itemId,
									quantity: 1,
									camp,
								},
							})
						);
						const currentChange = balanceChanges.get(userId) || 0;
						balanceChanges.set(userId, currentChange + price);
					}
				} else if (!shouldHaveItem && hasItem) {
					if (inventoryEntry) {
						operations.push(
							prisma.inventory.delete({
								where: { id: inventoryEntry.id },
							})
						);
						const currentChange = balanceChanges.get(userId) || 0;
						balanceChanges.set(userId, currentChange - price);
					}
				}
			}
		}

		for (const [userId, change] of balanceChanges.entries()) {
			if (change !== 0) {
				operations.push(
					prisma.balance.upsert({
						where: { user_camp: { user: userId, camp } },
						update: {
							amount: {
								increment: change,
							},
						},
						create: {
							user: userId,
							amount: change,
						},
					})
				);
			}
		}

		if (operations.length > 0) {
			await prisma.$transaction(operations);
		}

		return NextResponse.json(
			{ message: "User items updated successfully." },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Failed to update user items:", error);
		return NextResponse.json(
			{ error: "An error occurred while updating user items." },
			{ status: 500 }
		);
	}
}
