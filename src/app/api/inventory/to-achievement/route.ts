/**
 * @swagger
 * /api/inventory/to-achievement:
 *   post:
 *     summary: Synchronize item owners for an achievement
 *     tags: [Inventory]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SyncAchievementRequest'
 *     responses:
 *       200:
 *         description: Synchronization successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SyncAchievementResponse'
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Item not found
 *       500:
 *         description: Failed to synchronize item owners
 */
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { syncItemHolders } from "@/lib/inventory";
import { authOptions } from "@/lib/auth";
import { SyncAchievementRequest, SyncAchievementResponse } from "@/types";

export async function POST(
	req: NextRequest
): Promise<NextResponse<SyncAchievementResponse | { error: string }>> {
	const session = await getServerSession(authOptions);

	if (!session?.user?.is_org && !session?.user?.is_admin) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const { itemId, userIds }: SyncAchievementRequest = await req.json();

	if (itemId === undefined || itemId === null || !Array.isArray(userIds)) {
		return NextResponse.json(
			{ error: "itemId and userIds (array) are required" },
			{ status: 400 }
		);
	}

	const parsedItemId = parseInt(String(itemId), 10);
	if (isNaN(parsedItemId)) {
		return NextResponse.json({ error: "Invalid itemId" }, { status: 400 });
	}

	const desiredUserIds = new Set(
		userIds.map((id) => parseInt(String(id), 10)).filter((id) => !isNaN(id))
	);

	try {
		await prisma.$transaction(async (tx) => {
			await syncItemHolders(
				tx,
				parsedItemId,
				desiredUserIds,
				session.camp_id || -1
			);
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Failed to synchronize item owners:", error);
		if (error instanceof Error && error.message.includes("not found")) {
			return NextResponse.json({ error: error.message }, { status: 404 });
		}
		return NextResponse.json(
			{ error: "Failed to synchronize item owners" },
			{ status: 500 }
		);
	}
}
