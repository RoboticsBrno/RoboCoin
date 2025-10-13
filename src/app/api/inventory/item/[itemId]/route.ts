/**
 * @swagger
 * /api/inventory/item/{itemId}:
 *   get:
 *     summary: Get owners of an item
 *     tags: [Inventory]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the item
 *     responses:
 *       200:
 *         description: A list of user IDs who own the item
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: integer
 *       400:
 *         description: Invalid Item ID
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Failed to fetch item owners
 */
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ itemId: string }> }
) {
	const session = await getServerSession(authOptions);

	if (!session || (!session.user.is_org && !session.user.is_admin)) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const resolvedParams = await params;
	const itemId = parseInt(resolvedParams.itemId, 10);

	if (isNaN(itemId)) {
		return NextResponse.json({ error: "Invalid Item ID" }, { status: 400 });
	}

	try {
		const inventory = await prisma.inventory.findMany({
			where: { item: itemId },
			select: {
				user: true,
			},
		});

		const ownerIds = inventory.map((inv) => inv.user);
		return NextResponse.json(ownerIds);
	} catch (error) {
		console.error("Failed to fetch item owners:", error);
		return NextResponse.json(
			{ error: "Failed to fetch item owners" },
			{ status: 500 }
		);
	}
}
