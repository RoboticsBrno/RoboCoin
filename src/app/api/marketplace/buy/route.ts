import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { transferBalance } from "@/lib/balance";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session?.user) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const { itemId } = await req.json();

	if (!itemId) {
		return NextResponse.json(
			{ error: "Item ID is required" },
			{ status: 400 }
		);
	}

	const parsedItemId = parseInt(String(itemId), 10);
	if (isNaN(parsedItemId)) {
		return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
	}

	try {
		await prisma.$transaction(async (tx) => {
			const item = await tx.item.findUnique({
				where: { id: parsedItemId },
			});

			if (!item || !item.on_marketplace) {
				throw new Error("Item not found or not on marketplace");
			}

			const buyerId = parseInt(session.user.id);
			const sellerId = item.owner;

			if (buyerId === sellerId) {
				throw new Error("Cannot buy your own item");
			}

			const buyerBalance = await tx.balance.findUnique({
				where: {
					user_camp: { user: buyerId, camp: session.camp_id || -1 },
				},
			});

			if (!buyerBalance || buyerBalance.amount < item.price) {
				throw new Error("Insufficient balance");
			}

			await transferBalance(
				tx,
				buyerId,
				sellerId,
				item.price,
				`Nákup předmětu: ${item.title}`,
				session.camp_id || -1
			);

			await tx.item.update({
				where: { id: parsedItemId },
				data: {
					on_marketplace: false,
					owner: buyerId,
				},
			});

			await tx.inventory.create({
				data: {
					user: buyerId,
					item: parsedItemId,
					quantity: 1,
					camp: session.camp_id || -1,
				},
			});
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Failed to buy item:", error);
		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}
		return NextResponse.json(
			{ error: "Failed to buy item" },
			{ status: 500 }
		);
	}
}
