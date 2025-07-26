import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET all items
export async function GET(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const items = await prisma.item.findMany();
	return NextResponse.json(items);
}

// POST a new item
export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions);

	// 1. Authenticate the user
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// 2. Authorize the user (must be org or admin)
	if (!session.user.is_org && !session.user.is_admin) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const { title, description, price, on_marketplace } = await req.json();

	// 3. Validate the input data
	if (!title) {
		return NextResponse.json(
			{ error: "Title is required" },
			{ status: 400 }
		);
	}

	try {
		// 4. Create the new item (achievement)
		const newItem = await prisma.item.create({
			data: {
				title,
				description,
				price: price || 0,
				on_marketplace: on_marketplace || false,
				owner: parseInt(session.user.id), // The creator is the owner
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
