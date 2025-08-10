import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserItems } from "@/lib/api";

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session?.user || !session.user.is_admin) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const userItems: UserItems = await req.json();

	try {
		const allDbItems = await prisma.item.findMany({
			select: { id: true, title: true },
		});
		const itemMap = new Map(
			allDbItems.map((item) => [item.title, item.id])
		);

		const userLogins = Object.keys(userItems);
		const allDbUsers = await prisma.user.findMany({
			where: {
				login: { in: userLogins },
				deleted: false,
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
				item: { in: itemIds },
			},
		});

		const inventoryMap = new Map(
			currentInventory.map((inv) => [`${inv.user}-${inv.item}`, inv])
		);

		const operations: any[] = [];

		for (const userLogin of userLogins) {
			const userId = userMap.get(userLogin);
			if (!userId) continue;

			const itemsForUser = userItems[userLogin];
			for (const itemTitle of Object.keys(itemsForUser)) {
				const itemId = itemMap.get(itemTitle);
				if (!itemId) continue;

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
					} else {
						operations.push(
							prisma.inventory.create({
								data: {
									user: userId,
									item: itemId,
									quantity: 1,
								},
							})
						);
					}
				} else if (!shouldHaveItem && hasItem) {
					if (inventoryEntry) {
						operations.push(
							prisma.inventory.delete({
								where: { id: inventoryEntry.id },
							})
						);
					}
				}
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
