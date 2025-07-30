import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { syncUserInventory } from "@/lib/inventory";

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session?.user?.is_org && !session?.user?.is_admin) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const { userId, itemIds } = await req.json();

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
		itemIds.map(id => parseInt(String(id), 10)).filter(id => !isNaN(id))
	);

	try {
		await prisma.$transaction(async tx => {
			await syncUserInventory(tx, parsedUserId, desiredItemIds);
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
