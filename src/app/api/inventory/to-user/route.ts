import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { recalculateAndApplyBalance } from "@/lib/balance"; // Import the new service

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session || (!session.user.is_org && !session.user.is_admin)) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const { userId, itemIds } = await req.json();
	const parsedUserId = parseInt(userId, 10);
	const desiredItemIds = new Set(itemIds.map((id: string | number) => parseInt(id.toString(), 10)));

	if (!parsedUserId) {
		return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
	}

	try {
		await prisma.$transaction(async (tx) => {
			const currentInventory = await tx.inventory.findMany({
				where: { user: parsedUserId },
				select: { item: true },
			});
			const currentItemIds = new Set(currentInventory.map(inv => inv.item));

			const itemsToAdd = [...desiredItemIds].filter(id => !currentItemIds.has(id));
			const itemsToRemove = [...currentItemIds].filter(id => !desiredItemIds.has(id));

			if (itemsToRemove.length > 0) {
				await tx.inventory.deleteMany({
					where: { user: parsedUserId, item: { in: itemsToRemove } },
				});
			}

			if (itemsToAdd.length > 0) {
				await tx.inventory.createMany({
					data: itemsToAdd.map(itemId => ({ user: parsedUserId, item: itemId, quantity: 1 })),
				});
			}

			// After making changes, call the centralized function to sync the balance
			await recalculateAndApplyBalance(tx, parsedUserId);
		});

		return NextResponse.json({ success: true }, { status: 200 });
	} catch (error) {
		console.error("Failed to synchronize user inventory:", error);
		return NextResponse.json({ error: "Failed to synchronize inventory" }, { status: 500 });
	}
}
