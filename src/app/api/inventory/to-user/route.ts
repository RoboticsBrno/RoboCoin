/**
 * @swagger
 * /api/inventory/to-user:
 *   post:
 *     summary: Synchronize inventory for a user
 *     tags: [Inventory]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SyncUserInventoryRequest'
 *     responses:
 *       200:
 *         description: Synchronization successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SyncUserInventoryResponse'
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Failed to synchronize inventory
 */
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { syncUserInventory } from "@/lib/inventory";
import { authOptions } from "@/lib/auth";
import { SyncUserInventoryRequest, SyncUserInventoryResponse } from "@/types";

export async function POST(
	req: NextRequest
): Promise<NextResponse<SyncUserInventoryResponse | { error: string }>> {
	const session = await getServerSession(authOptions);

	if (!session?.user?.is_org && !session?.user?.is_admin) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const { userId, itemIds }: SyncUserInventoryRequest = await req.json();

	if (userId === undefined || userId === null || !Array.isArray(itemIds)) {
		return NextResponse.json(
			{ error: "userId and itemIds (array) are required" },
			{ status: 400 }
		);
	}

	const parsedUserId = parseInt(String(userId), 10);
	if (isNaN(parsedUserId)) {
		return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
	}

	const desiredItemIds = new Set(
		itemIds.map((id) => parseInt(String(id), 10)).filter((id) => !isNaN(id))
	);

	try {
		await prisma.$transaction(async (tx) => {
			await syncUserInventory(
				tx,
				parsedUserId,
				desiredItemIds,
				session.camp_id
			);
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Failed to synchronize user inventory:", error);
		return NextResponse.json(
			{ error: "Failed to synchronize inventory" },
			{ status: 500 }
		);
	}
}
