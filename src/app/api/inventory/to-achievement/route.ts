import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { syncItemHolders } from "@/lib/inventory";

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions);

	if (!session?.user?.is_org && !session?.user?.is_admin) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const { itemId, userIds } = await req.json();

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
		userIds.map(id => parseInt(String(id), 10)).filter(id => !isNaN(id))
	);

	try {
		await prisma.$transaction(async tx => {
			await syncItemHolders(tx, parsedItemId, desiredUserIds);
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
