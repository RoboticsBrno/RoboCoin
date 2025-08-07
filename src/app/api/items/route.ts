import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

// GET all items
export async function GET(req: NextRequest) {
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
export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	if (!session.user.is_org && !session.user.is_admin) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const { title, description, price, on_marketplace } = await req.json();

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
				owner: session.user.id,
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
