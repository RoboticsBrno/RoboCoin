/**
 * @swagger
 * /api/achievements:
 *   get:
 *     summary: Get user's achievements for the current camp
 *     tags: [Achievements]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of user's achievements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InventoryItem'
 *       400:
 *         description: Camp not selected
 *       401:
 *         description: Unauthorized
 */
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { InventoryItem } from "@/lib/api";
import { authOptions } from "@/lib/auth";

export async function GET(): Promise<NextResponse<InventoryItem[] | { error: string }>> {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (!session.camp_id) {
		return NextResponse.json({ error: "Camp not selected" }, { status: 400 });
	}

	const achievements: InventoryItem[] = await prisma.inventory.findMany({
		where: { user: parseInt(session.user.id), camp: session.camp_id },
		include: {
			item_inventory_itemToitem: true,
		},
	});

	return NextResponse.json(achievements);
}
