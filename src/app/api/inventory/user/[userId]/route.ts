/**
 * @swagger
 * /api/inventory/user/{userId}:
 *   get:
 *     summary: Get inventory for a user
 *     tags: [Inventory]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: A list of item IDs in the user's inventory
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: integer
 *       400:
 *         description: Invalid User ID
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Failed to fetch user inventory
 */
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ userId: string }> }
) {
	const session = await getServerSession(authOptions);

	if (!session || (!session.user.is_org && !session.user.is_admin)) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}
	const resolvedParams = await params;
	const userId = parseInt(resolvedParams.userId, 10);

	if (isNaN(userId)) {
		return NextResponse.json({ error: "Invalid User ID" }, { status: 400 });
	}

	try {
		const inventory = await prisma.inventory.findMany({
			where: { user: userId },
			select: {
				item: true, // We only need the IDs of the items they have
			},
		});

		// Return a simple array of item IDs for easy lookup on the client
		const ownedItemIds = inventory.map((inv) => inv.item);
		return NextResponse.json(ownedItemIds);
	} catch (error) {
		console.error("Failed to fetch user inventory:", error);
		return NextResponse.json(
			{ error: "Failed to fetch user inventory" },
			{ status: 500 }
		);
	}
}
