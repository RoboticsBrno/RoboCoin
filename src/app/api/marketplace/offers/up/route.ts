/**
 * @swagger
 * /api/marketplace/offers/up:
 *   get:
 *     summary: Get items that are up for sale on the marketplace
 *     description: Fetches items that are on the marketplace, owned by the user, and have no transactions.
 *     tags: [Marketplace]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 *       401:
 *         description: Unauthorized
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const items = await prisma.item.findMany({
		where: {
			on_marketplace: true,
			owner: parseInt(session.user.id),
			camp: session.camp_id || -1,
			transaction_transaction_itemToitem: {
				none: {},
			},
		},
	});

	return NextResponse.json(items);
}
