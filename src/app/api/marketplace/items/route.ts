/**
 * @swagger
 * /api/marketplace/items:
 *   get:
 *     summary: Get all items on the marketplace for the current camp
 *     tags: [Marketplace]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of items on the marketplace
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create a new item on the marketplace
 *     tags: [Marketplace]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
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
 *       500:
 *         description: Failed to create item
 */
import { NextRequest, NextResponse } from "next/server";
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
			camp: session.camp_id || -1,
		},
		include: {
			user: true,
		},
	});

	return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { title, description, price } = await req.json();

	if (!title) {
		return NextResponse.json(
			{ error: "Title is required" },
			{ status: 400 }
		);
	}

	try {
		const newItem = await prisma.item.create({
			data: {
				title,
				description,
				price: price || 0,
				on_marketplace: true,
				from_marketplace: true,
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
