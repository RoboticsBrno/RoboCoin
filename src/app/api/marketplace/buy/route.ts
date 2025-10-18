/**
 * @swagger
 * /api/marketplace/buy:
 *   post:
 *     summary: Buy an item from the marketplace
 *     tags: [Marketplace]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BuyItemRequest'
 *     responses:
 *       200:
 *         description: Purchase successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BuyItemResponse'
 *       400:
 *         description: Invalid item ID or insufficient funds
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Item not found
 *       500:
 *         description: Transaction failed
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { transferBalance } from "@/lib/balance";
import { BuyItemRequest, BuyItemResponse } from "@/types";

export async function POST(req: NextRequest): Promise<NextResponse<BuyItemResponse | { error: string }>> {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id: itemId }: BuyItemRequest = await req.json();

	if (!itemId || isNaN(itemId)) {
		return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
	}

	const buyerId = parseInt(session.user.id);

	try {
		const item = await prisma.item.findUnique({
			where: { id: itemId },
		});

		if (!item) {
			return NextResponse.json(
				{ error: "Item not found" },
				{ status: 404 }
			);
		}

		if (!item.on_marketplace) {
			return NextResponse.json(
				{ error: "Item is not for sale" },
				{ status: 400 }
			);
		}

		const buyerBalance = await prisma.balance.findUnique({
			where: { user_camp: { user: buyerId, camp: item.camp } },
		});

		if (!buyerBalance || buyerBalance.amount < item.price) {
			return NextResponse.json(
				{ error: "Insufficient funds" },
				{ status: 400 }
			);
		}

		await prisma.$transaction(async (tx) => {
			await tx.item.update({
				where: { id: item.id },
				data: { owner: buyerId, on_marketplace: false },
			});

			await transferBalance(
				tx,
				buyerId,
				item.owner,
				item.price,
				`Purchase of ${item.title}`,
				session.camp_id || -1
			);
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Transaction failed:", error);
		return NextResponse.json(
			{ error: "Transaction failed" },
			{ status: 500 }
		);
	}
}