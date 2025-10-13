/**
 * @swagger
 * /api/marketplace/item/{id}:
 *   get:
 *     summary: Get a specific item from the marketplace
 *     tags: [Marketplace]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the item
 *     responses:
 *       200:
 *         description: The item
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ItemWithUser'
 *       400:
 *         description: Invalid item ID
 *       404:
 *         description: Item not found
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ItemWithUser } from "@/lib/api";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const resolvedParams = await params;
	const id = parseInt(resolvedParams.id);

	if (isNaN(id)) {
		return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
	}

	const item: ItemWithUser = await prisma.item.findUnique({
		where: {
			id: id,
		},
		include: {
			user: true,
		},
	});

	if (!item) {
		return NextResponse.json({ error: "Item not found" }, { status: 404 });
	}

	return NextResponse.json(item);
}
