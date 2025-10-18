/**
 * @swagger
 * /api/my-items:
 *   get:
 *     summary: Get items owned by the user from the marketplace
 *     description: Fetches items owned by the user that were bought from the marketplace and are not currently on the marketplace.
 *     tags: [Items]
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
 *       500:
 *         description: Failed to fetch user items
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { Item } from "@/types";
import { authOptions } from "@/lib/auth";

export async function GET(): Promise<NextResponse<Item[] | { error: string }>> {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = parseInt(session.user.id);

	try {
		const items: Item[] = await prisma.item.findMany({
			where: {
				owner: userId,
				from_marketplace: true,
				on_marketplace: false,
			},
		});

		return NextResponse.json(items);
	} catch (error) {
		console.error("Failed to fetch user items:", error);
		return NextResponse.json(
			{ error: "Failed to fetch user items" },
			{ status: 500 }
		);
	}
}
