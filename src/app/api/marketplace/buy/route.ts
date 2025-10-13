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
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Purchase successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
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

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id: itemId } = await req.json();

	if (!itemId || isNaN(parseInt(itemId))) {
		return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
	}

	const buyerId = parseInt(session.user.id);

	try {
		const item = await prisma.item.findUnique({
			where: { id: parseInt(itemId) },
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
