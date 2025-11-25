/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: Get all items (not from marketplace)
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
 *   post:
 *     summary: Create a new item
 *     tags: [Items]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateItemRequest'
 *     responses:
 *       201:
 *         description: The created item
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       400:
 *         description: Title is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Item with this title already exists
 *       500:
 *         description: Failed to create item
 */
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { CreateItemRequest, Item } from "@/types";

// GET all items
export async function GET(): Promise<NextResponse<Item[] | { error: string }>> {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const items = await prisma.item.findMany({
		where: {
			from_marketplace: false,
		},
	});
	return NextResponse.json(items);
}

// POST a new item
export async function POST(
	req: NextRequest
): Promise<NextResponse<Item | { error: string }>> {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (!session.user.is_org && !session.user.is_admin) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const { title, description, price, on_marketplace }: CreateItemRequest =
		await req.json();

	if (!title) {
		return NextResponse.json(
			{ error: "Title is required" },
			{ status: 400 }
		);
	}

	const existingItem = await prisma.item.findFirst({
		where: { title },
	});
	if (existingItem) {
		return NextResponse.json(
			{ error: "Item with this title already exists" },
			{ status: 409 }
		);
	}

	try {
		const newItem = await prisma.item.create({
			data: {
				title,
				description,
				price: price || 0,
				on_marketplace: on_marketplace || false,
				owner: parseInt(session.user.id),
				camp: session.camp_id || -1,
			},
		});

		return NextResponse.json(newItem, { status: 201 });
	} catch (error) {
		console.error("Failed to create item:", error);
		return NextResponse.json(
			{ error: "Failed to create item" },
			{ status: 500 }
		);
	}
}
