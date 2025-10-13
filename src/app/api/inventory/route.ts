/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Get the entire inventory
 *     tags: [Inventory]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of inventory items with user login and item title
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InventoryWithUserAndItem'
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Failed to fetch inventory
 *   post:
 *     summary: Assign an item to a user
 *     tags: [Inventory]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - itemId
 *             properties:
 *               userId:
 *                 type: integer
 *               itemId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: The created inventory item
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryItem'
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Failed to assign item
 */
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { Prisma } from "../../../../generated/prisma";

export async function GET(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session?.user) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	try {
		const inventory = await prisma.inventory.findMany({
			include: {
				user_inventory_userTouser: {
					select: { login: true },
				},
				item_inventory_itemToitem: {
					select: { title: true },
				},
			},
		});

		const response = inventory.map((inv) => ({
			userLogin: inv.user_inventory_userTouser.login,
			itemTitle: inv.item_inventory_itemToitem.title,
			quantity: inv.quantity,
		}));

		return NextResponse.json(response, { status: 200 });
	} catch (error) {
		console.error("Failed to fetch inventory:", error);
		return NextResponse.json(
			{ error: "Failed to fetch inventory" },
			{ status: 500 }
		);
	}
}

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions);

	// 1. Authenticate and authorize the user
	if (!session || (!session.user.is_org && !session.user.is_admin)) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	if (!session.camp_id) {
		return NextResponse.json({ error: "Camp not found" }, { status: 400 });
	}

	const { userId, itemId, quantity } = await req.json();

	// 2. Validate the input data
	if (!userId || !itemId) {
		return NextResponse.json(
			{ error: "User ID and Item ID are required" },
			{ status: 400 }
		);
	}

	try {
		// 3. Create the inventory record to assign the achievement
		const newInventoryItem = await prisma.inventory.create({
			data: {
				user: parseInt(userId, 10),
				item: parseInt(itemId, 10),
				quantity: quantity ? parseInt(quantity, 10) : 1,
				camp: session.camp_id,
			},
		});

		return NextResponse.json(newInventoryItem, { status: 201 });
	} catch (error) {
		console.error("Failed to assign item:", error);
		// Handle potential errors, e.g., user or item not found
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === "P2003") {
				// Foreign key constraint failed
				return NextResponse.json(
					{ error: "Invalid User ID or Item ID" },
					{ status: 400 }
				);
			}
		} else if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		} else {
			return NextResponse.json(
				{ error: "Failed to assign item" },
				{ status: 500 }
			);
		}
	}
}
