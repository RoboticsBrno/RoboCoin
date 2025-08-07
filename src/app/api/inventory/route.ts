import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { Prisma } from "../../../../generated/prisma";

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions);

	// 1. Authenticate and authorize the user
	if (!session || (!session.user.is_org && !session.user.is_admin)) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
