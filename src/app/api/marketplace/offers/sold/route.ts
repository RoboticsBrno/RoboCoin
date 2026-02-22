/**
 * @swagger
 * /api/marketplace/offers/sold:
 *   get:
 *     summary: Get items sold by the user on the marketplace
 *     tags: [Marketplace]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of items sold by the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ItemWithUser'
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
    console.log(parseInt(session.user.id));
	const items = await prisma.item.findMany({
		where: {
			on_marketplace: false,
			camp: session.camp_id || -1,
			transaction_transaction_itemToitem: {
				some: {
					receiver: parseInt(session.user.id),
				},
			},
		},
		include: {
			user: true,
		},
	});

	return NextResponse.json(items);
}
