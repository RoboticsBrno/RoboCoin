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
			user: {
				deleted: false,
			},
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
